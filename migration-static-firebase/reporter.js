import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { browserSessionPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, updateDoc, where } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';
import { WB_DISTRICTS } from './wb-map-data.js';
import { DISTRICT_SUBCATEGORIES } from './district-content.js';

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

let db;
let auth;
let currentUser;
let drafts = [];

function populateDistrictFields() {
  const district = $('reporter-district');
  const subcategory = $('reporter-subcategory');
  if (district && !district.options.length) district.innerHTML = '<option value="">State-wide / no specific district</option>' + WB_DISTRICTS.map(item => `<option value="${item.id}">${item.nameBn} · ${item.nameEn}</option>`).join('');
  if (subcategory && !subcategory.options.length) subcategory.innerHTML = DISTRICT_SUBCATEGORIES.map(item => `<option value="${item.id}">${item.label.BN} · ${item.label.EN}</option>`).join('');
}

function resetForm() {
  $('reporter-story-form').reset();
  $('reporter-draft-id').value = '';
  $('reporter-form-title').textContent = 'Story details';
  $('reporter-save').textContent = 'Save draft';
  status('reporter-form-status', '');
  $('reporter-title-en').focus();
}

function loadDraft(draft) {
  $('reporter-draft-id').value = draft.id;
  $('reporter-title-en').value = draft.title?.EN || '';
  $('reporter-title-bn').value = draft.title?.BN || '';
  $('reporter-title-hi').value = draft.title?.HI || '';
  $('reporter-category').value = draft.category || 'national';
  $('reporter-district').value = draft.districtId || draft.primaryDistrictId || '';
  $('reporter-subcategory').value = draft.subcategory || 'other';
  $('reporter-coverage-scope').value = draft.coverageScope || (draft.districtId ? 'district' : 'state');
  $('reporter-summary-en').value = draft.summary?.EN || '';
  $('reporter-summary-bn').value = draft.summary?.BN || '';
  $('reporter-summary-hi').value = draft.summary?.HI || '';
  $('reporter-content-en').value = draft.content?.EN || '';
  $('reporter-content-bn').value = draft.content?.BN || '';
  $('reporter-content-hi').value = draft.content?.HI || '';
  $('reporter-source-url').value = draft.sourceUrl || '';
  $('reporter-image-url').value = draft.image || '';
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
    <h4>${escapeHtml(draft.title?.EN || 'Untitled draft')}</h4>
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
    title: { EN: $('reporter-title-en').value.trim(), BN: $('reporter-title-bn').value.trim(), HI: $('reporter-title-hi').value.trim() },
    summary: { EN: $('reporter-summary-en').value.trim(), BN: $('reporter-summary-bn').value.trim(), HI: $('reporter-summary-hi').value.trim() },
    content: { EN: $('reporter-content-en').value.trim(), BN: $('reporter-content-bn').value.trim(), HI: $('reporter-content-hi').value.trim() },
    category: $('reporter-category').value,
    districtId: $('reporter-district').value || '',
    primaryDistrictId: $('reporter-district').value || '',
    districtIds: $('reporter-district').value ? [$('reporter-district').value] : [],
    coverageScope: $('reporter-coverage-scope').value,
    subcategory: $('reporter-subcategory').value,
    author: currentUser.displayName || currentUser.email || 'YUGANTAR Reporter',
    sourceAgency: 'YUGANTAR', sourceLanguage: 'EN',
    sourceUrl: safeUrl(sourceInput), image: safeUrl(imageInput),
    status: nextStatus, hero: false, trending: false,
    updatedAt: serverTimestamp(), updatedBy: currentUser.uid
  };
}

function bindWorkspace() {
  $('reporter-story-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.submitter || $('reporter-save');
    const nextStatus = button.dataset.action === 'submit' ? 'submitted' : 'draft';
    button.disabled = true;
    try {
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
