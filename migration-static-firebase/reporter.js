import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { browserSessionPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, updateDoc, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';
import { WB_DISTRICTS } from './wb-map-data.js';
import { ARTICLE_CATEGORIES, DISTRICT_SUBCATEGORIES } from './district-content.js';

const $ = id => document.getElementById(id);
const status = (id, message, error = false) => {
  const node = $(id);
  if (node) { node.textContent = message; node.className = `status${error ? ' error' : ''}`; }
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const safeUrl = value => {
  try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
};
const displayDate = value => {
  const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Not saved yet';
};

function updateReporterImagePreview() {
  const file = $('reporter-image-file')?.files?.[0];
  const url = safeUrl($('reporter-image-url')?.value);
  const preview = $('reporter-image-preview');
  if (!preview) return;
  if (file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      const message = 'Upload failed: choose a JPG, PNG or WebP image smaller than 2 MB.';
      status('reporter-form-status', message, true); window.alert(message);
      $('reporter-image-file').value = '';
      updateReporterImagePreview();
      return;
    }
    preview.innerHTML = `<img src="${escapeHtml(URL.createObjectURL(file))}" alt="Selected cover preview">`;
  } else {
    preview.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Cover preview" onerror="this.parentElement.textContent='This image URL could not be loaded.'">` : 'Cover preview appears here';
  }
}

async function uploadReporterImage() {
  const file = $('reporter-image-file')?.files?.[0];
  if (!file) return '';
  const token = await currentUser.getIdToken(true);
  const body = new FormData(); body.append('image', file, file.name);
  const response = await fetch('./api/upload-image.php', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body });
  let payload = {}; try { payload = await response.json(); } catch {}
  if (!response.ok || !payload.url) { const message = payload.error || 'Upload failed: the image could not be uploaded.'; window.alert(message); throw new Error(message); }
  return new URL(payload.url, window.location.href).href;
}

let db;
let auth;
let currentUser;
let drafts = [];

function setReporterLanguage() {
  document.querySelector('[data-reporter-language-panel="bn"]')?.classList.add('active');
  document.querySelectorAll('[data-reporter-language-panel]:not([data-reporter-language-panel="bn"])').forEach(panel => panel.classList.remove('active'));
}

function populateDistrictFields() {
  const category = $('reporter-category');
  const district = $('reporter-district');
  const subcategory = $('reporter-subcategory');
  if (category) category.innerHTML = ARTICLE_CATEGORIES.map(item => `<option value="${item.id}">${item.label.EN}</option>`).join('');
  if (district && !district.options.length) district.innerHTML = '<option value="">State-wide / no specific district</option>' + WB_DISTRICTS.map(item => `<option value="${item.id}">${item.nameEn}</option>`).join('');
  if (subcategory && !subcategory.options.length) subcategory.innerHTML = DISTRICT_SUBCATEGORIES.map(item => `<option value="${item.id}">${item.label.EN}</option>`).join('');
}

function resetForm() {
  $('reporter-story-form').reset();
  setReporterLanguage();
  $('reporter-draft-id').value = '';
  $('reporter-form-title').textContent = 'Story details';
  $('reporter-save').textContent = 'Save draft';
  updateReporterImagePreview();
  status('reporter-form-status', '');
  $('reporter-title-bn').focus();
}

function loadDraft(draft) {
  setReporterLanguage();
  $('reporter-draft-id').value = draft.id;
  $('reporter-title-bn').value = draft.title?.BN || '';
  $('reporter-category').value = draft.category || 'national';
  $('reporter-district').value = draft.districtId || draft.primaryDistrictId || '';
  $('reporter-subcategory').value = draft.subcategory || 'other';
  $('reporter-coverage-scope').value = draft.coverageScope || (draft.districtId ? 'district' : 'state');
  $('reporter-summary-bn').value = draft.summary?.BN || '';
  $('reporter-content-bn').value = draft.content?.BN || '';
  $('reporter-source-url').value = draft.sourceUrl || '';
  $('reporter-image-url').value = draft.image || '';
  updateReporterImagePreview();
  $('reporter-form-title').textContent = 'Edit your draft';
  $('reporter-save').textContent = 'Save changes';
  $('reporter-submit').textContent = draft.status === 'rejected' ? 'Resubmit for review' : 'Submit for review';
  status('reporter-form-status', `Editing draft · Last saved ${displayDate(draft.updatedAt || draft.createdAt)}`);
  $('reporter-story-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderDrafts() {
  const target = $('reporter-drafts');
  if (!drafts.length) {
    target.innerHTML = '<div class="empty-state">No saved drafts yet. Start a story using the form.</div>';
    return;
  }
  target.innerHTML = drafts.map(draft => `<article class="reporter-draft-item">
    <span class="status-chip ${escapeHtml(draft.status || 'draft')}">${escapeHtml(String(draft.status || 'draft').replace('_', ' ').toUpperCase())}</span>
    <h4>${escapeHtml(draft.title?.BN || 'Untitled draft')}</h4>
    <p>${escapeHtml(draft.category || 'news')}${draft.districtId ? ` · ${escapeHtml(draft.districtId)}` : ''}${draft.reviewNote ? ` · ${escapeHtml(draft.reviewNote)}` : ''}</p>
    <small>Updated ${escapeHtml(displayDate(draft.updatedAt || draft.createdAt))}</small>
    ${['draft', 'rejected'].includes(draft.status) ? `<button class="button button-muted reporter-edit-draft" type="button" data-edit-draft="${escapeHtml(draft.id)}">Continue editing</button>` : ''}
  </article>`).join('');
  target.querySelectorAll('[data-edit-draft]').forEach(button => button.addEventListener('click', () => {
    const draft = drafts.find(item => item.id === button.dataset.editDraft);
    if (draft) loadDraft(draft);
  }));
}

async function refreshDrafts() {
  if (!currentUser) return;
  $('reporter-drafts').innerHTML = '<div class="empty-state">Loading your drafts…</div>';
  try {
    const result = await getDocs(query(collection(db, 'articles'), where('createdBy', '==', currentUser.uid)));
    drafts = result.docs.map(snapshot => ({ ...snapshot.data(), id: snapshot.id }))
      .filter(article => ['draft', 'submitted', 'under_review', 'approved', 'published', 'rejected'].includes(article.status))
      .sort((a, b) => {
        const aDate = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
        const bDate = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
        return bDate - aDate;
      });
    renderDrafts();
  } catch (error) {
    console.error('Reporter drafts could not be loaded:', error);
    $('reporter-drafts').innerHTML = '<div class="empty-state">Your drafts could not be loaded. Check your connection and try again.</div>';
  }
}

function articlePayload(nextStatus = 'draft') {
  const sourceInput = $('reporter-source-url').value.trim();
  const imageInput = $('reporter-image-url').value.trim();
  if (sourceInput && !safeUrl(sourceInput)) throw new Error('Enter a valid source link beginning with http:// or https://.');
  if (imageInput && !safeUrl(imageInput)) throw new Error('Enter a valid image link beginning with http:// or https://.');
  return {
    title: { BN: $('reporter-title-bn').value.trim() },
    summary: { BN: $('reporter-summary-bn').value.trim() },
    content: { BN: $('reporter-content-bn').value.trim() },
    category: $('reporter-category').value,
    districtId: $('reporter-district').value || '',
    primaryDistrictId: $('reporter-district').value || '',
    districtIds: $('reporter-district').value ? [$('reporter-district').value] : [],
    coverageScope: $('reporter-coverage-scope').value,
    subcategory: $('reporter-subcategory').value,
    author: currentUser.displayName || currentUser.email || 'YUGANTAR Reporter',
    sourceAgency: 'YUGANTAR', sourceLanguage: 'BN',
    sourceUrl: safeUrl(sourceInput), image: safeUrl(imageInput),
    status: nextStatus, hero: false, trending: false,
    updatedAt: serverTimestamp(), updatedBy: currentUser.uid
  };
}

function bindWorkspace() {
  setReporterLanguage();
  $('reporter-story-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.submitter || $('reporter-save');
    const nextStatus = button.dataset.action === 'submit' ? 'submitted' : 'draft';
    const missingBengaliField = [$('reporter-title-bn'), $('reporter-summary-bn'), $('reporter-content-bn')].find(field => !field.value.trim());
    if (missingBengaliField) {
      setReporterLanguage();
      status('reporter-form-status', 'Add the Bengali headline, summary, and full story before saving or submitting.', true);
      missingBengaliField.focus();
      return;
    }
    button.disabled = true;
    try {
      const uploadedUrl = await uploadReporterImage();
      if (uploadedUrl) $('reporter-image-url').value = uploadedUrl;
      const payload = articlePayload(nextStatus);
      const draftId = $('reporter-draft-id').value;
      if (draftId) {
        const existing = drafts.find(item => item.id === draftId);
        if (!existing || existing.createdBy !== currentUser.uid || !['draft', 'rejected'].includes(existing.status)) {
          throw new Error('This draft is no longer available to edit. Refresh your drafts.');
        }
        await updateDoc(doc(db, 'articles', draftId), payload);
        status('reporter-form-status', nextStatus === 'submitted' ? 'Submitted to the editor for review.' : 'Draft changes saved. It is still private.');
      } else {
        const ref = await addDoc(collection(db, 'articles'), {
          ...payload, createdBy: currentUser.uid, createdAt: serverTimestamp(), ...(nextStatus === 'submitted' ? { submittedAt: serverTimestamp() } : {})
        });
        $('reporter-draft-id').value = ref.id;
        $('reporter-form-title').textContent = 'Edit your draft';
        $('reporter-save').textContent = 'Save changes';
        status('reporter-form-status', nextStatus === 'submitted' ? 'Submitted to the editor for review.' : 'Draft saved. It is still private.');
      }
      await refreshDrafts();
    } catch (error) {
      console.error('Reporter draft could not be saved:', error);
      status('reporter-form-status', error.message || 'Could not save the draft. Please try again.', true);
    } finally { button.disabled = false; }
  });
  $('reporter-new-draft').addEventListener('click', resetForm);
  $('reporter-refresh').addEventListener('click', refreshDrafts);
  $('reporter-image-file')?.addEventListener('change', updateReporterImagePreview);
  $('reporter-image-url')?.addEventListener('input', updateReporterImagePreview);
  $('reporter-signout').addEventListener('click', () => signOut(auth));
  $('reporter-submit').dataset.action = 'submit';
}

if (!firebaseConfigured) {
  $('reporter-setup').textContent = 'Firebase is not configured. Set up the Firebase client configuration before using the reporter workspace.';
  $('reporter-setup').classList.remove('hidden');
} else {
  const app = initializeApp(firebaseConfig, 'yugantar-reporter');
  auth = getAuth(app);
  db = getFirestore(app);
  await setPersistence(auth, browserSessionPersistence);
  populateDistrictFields();
  $('reporter-login-form').addEventListener('submit', async event => {
    event.preventDefault();
    status('reporter-login-status', 'Signing in…');
    try {
      await signInWithEmailAndPassword(auth, $('reporter-email').value.trim(), $('reporter-password').value);
    } catch (error) {
      const messages = {
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/user-not-found': 'No account was found for this email.',
        'auth/wrong-password': 'The password is incorrect.',
        'auth/operation-not-allowed': 'Email and password sign-in is not enabled.',
        'auth/unauthorized-domain': 'This website is not enabled for Firebase sign-in.'
      };
      status('reporter-login-status', messages[error.code] || 'Could not sign in. Please try again.', true);
    }
  });
  bindWorkspace();
  onAuthStateChanged(auth, async user => {
    currentUser = null;
    drafts = [];
    if (!user) {
      $('reporter-login').classList.remove('hidden');
      $('reporter-workspace').classList.add('hidden');
      $('reporter-drafts').innerHTML = '<div class="empty-state">Sign in to see your drafts.</div>';
      return;
    }
    try {
      const profile = await getDoc(doc(db, 'users', user.uid));
      if (!profile.exists() || profile.data().role !== 'reporter') {
        await signOut(auth);
        status('reporter-login-status', 'This account does not have reporter access. Contact an editor if you need access.', true);
        return;
      }
      currentUser = user;
      $('reporter-login').classList.add('hidden');
      $('reporter-workspace').classList.remove('hidden');
      $('reporter-account').textContent = user.displayName ? `${user.displayName} · ${user.email || ''}` : (user.email || 'Reporter account');
      await refreshDrafts();
    } catch (error) {
      console.error('Reporter role verification failed:', error);
      await signOut(auth);
      status('reporter-login-status', 'Could not verify reporter permissions. Please try again.', true);
    }
  });
}
