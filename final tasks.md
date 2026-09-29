# YUGANTAR Migration — Final Deployment Task Plan

Status: planning only. No new feature work is being implemented from this document yet.

This plan applies only to `migration-static-firebase/`. The React/Node application in `frontend/` and `backend/` is out of scope.

The project is intended to deploy as HTML/CSS/browser JavaScript on Hostinger Single, with Firebase Firestore/Auth and a private PHP worker running from a Hostinger cron job.

## Current audit findings

The migration already has a working public shell, Firebase reads, authentication, Firestore rules, admin publishing for core content, YouTube synchronization, polling, soft-hidden videos, RSS synchronization, a PHP worker, and the new GeoJSON district map.

The following items still block a genuinely production-ready launch:

1. `app.js`, `videos.js`, and `admin.js` contain demo/fallback articles and videos. These are useful for development but must never appear as fake newsroom content in production when Firebase is empty or unavailable.
2. The ticker error handler displays hardcoded sample headlines instead of a clear unavailable state.
3. The subscriber modal currently increments a local-storage counter and does not save the subscriber's name, contact, or district. The bottom newsletter form only stores an email in Firestore.
4. The subscriber flow has no duplicate handling, unsubscribe mechanism, consent text, source tracking, verification state, or admin subscriber view.
5. The careers form currently displays a local success message and does not save an application anywhere.
6. Resume upload is not implemented, and the recommended first release will not add resume storage. The application should collect candidate details and let the admin contact the candidate by Gmail to request a resume privately.
7. Static translations cover much of the interface, but dynamic article titles, summaries, bodies, ticker content, poll content, district content, job content, and validation/status messages are not consistently translated.
8. The default language is English because the stored-language fallback is `EN`. The production default must be Bengali (`BN`) while still allowing English and Hindi.
9. The requested Bengali motto is not yet the canonical site slogan everywhere:

   `নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।`

10. The admin desk does not yet provide subscriber management, job-application management, candidate follow-up tracking, audit history, moderation queues, or a complete role-specific experience.
11. Reporter permissions exist partially in Firestore rules, but there is no dedicated reporter page or complete submit-for-review workflow.
12. Reporter-created drafts need an explicit review lifecycle: draft → submitted → under review → approved/published or rejected with feedback.
13. The current admin article form mainly captures English content. Bengali and Hindi article title/content fields and editorial validation must be expanded.
14. Facebook support remains dependent on Meta Page ownership, permissions, approved Graph API access, and valid page tokens. Arbitrary Facebook profiles, groups, or posts cannot be safely scraped.
15. Image URLs are external and can fail because of hotlink protection, deleted media, or provider restrictions. The production fallback is acceptable, but image-rights and reliable media hosting still need a final policy.
16. Firestore rules and indexes must be deployed and tested against the final client Firebase project, not only the development project.
17. Subscription, career, reporter, and moderation collections need security rules, indexes, retention rules, and abuse protection before public launch.
18. A production error/maintenance state is needed for Firebase outages, worker failures, empty feeds, failed images, and unavailable provider APIs.
19. Hostinger deployment must exclude all service-account files, worker configuration, local secrets, archives, development scripts, and any future private candidate files from `public_html`.
20. The worker needs a final production dry-run, duplicate/idempotency test, source-rights review, cron test, and log-retention plan.

## Product decisions to lock before implementation

These decisions should be confirmed once and then treated as the shared contract for both developers:

- Public language order: Bengali default, English second, Hindi third.
- Public article status: only `approved`/`published` content is visible.
- Reporter content is never published directly.
- Admin/editor approval is required before public publication.
- Rejected submissions remain visible to the reporter with a private reason.
- YouTube records use soft hide/restore controls; permanent deletion is exceptional.
- Subscriber records are consent-based and must support unsubscribe/deactivation.
- Candidate records are private and must not be publicly queryable.
- In the first release, candidates submit details only; admins contact shortlisted candidates by Gmail to request resumes. No resume file is stored by the website.
- External article feeds are metadata/discovery sources unless the publication rights explicitly permit republication.
- The site displays summaries, source attribution, links, and approved media rather than copying full protected articles.

## Shared Firestore contract

The exact field names must be agreed before parallel implementation. Suggested collections:

```text
articles/{articleId}
  title: { BN, EN, HI }
  summary: { BN, EN, HI }
  content: { BN, EN, HI }
  category
  districtId
  image
  sourceUrl
  sourceAgency
  author
  status: draft | submitted | under_review | approved | published | rejected | archived
  createdBy
  reviewedBy
  reviewNote
  createdAt
  updatedAt
  publishedAt

subscribers/{subscriberId}
  name
  email
  phone
  districtId
  consent
  source: header | newsletter | campaign
  status: pending | active | unsubscribed | blocked
  createdAt
  updatedAt

jobApplications/{applicationId}
  position
  name
  email
  phone
  districtId
  portfolioUrl
  pitch
  status: received | shortlisted | interview | selected | rejected | withdrawn
  resumeStatus: not_requested | requested | received_by_email
  contactStatus: not_contacted | contacted | replied | unreachable
  contactedAt
  adminNote
  createdAt
  updatedAt

reporterSubmissions/{submissionId}
  reporterUid
  contentType: article | poll | ticker | social_item
  draftData
  status: draft | submitted | under_review | approved | rejected
  reviewNote
  reviewedBy
  createdAt
  updatedAt

auditLogs/{logId}
  actorUid
  action
  collection
  documentId
  summary
  createdAt
```

The final implementation may use separate article/poll submission collections, but it must preserve the same security and review semantics.

## Parallel work model

Arnab and Sahitya can both work across the complete repository. The division below is by feature/workstream, not by permanent file ownership. Either developer may edit any file when needed, but both developers must coordinate changes to shared schemas, authentication, Firestore rules, translation keys, and common CSS/JavaScript utilities.

The purpose of the split is to reduce simultaneous edits to the same feature, not to restrict capability.

### Collaboration rules

- Both developers may inspect and edit any repository file.
- Before starting a workstream, announce the intended scope and files likely to change.
- Use a separate branch for each workstream and keep commits small and feature-focused.
- Do not edit shared Firestore field names, role names, status values, or translation-key names without updating this plan and notifying the other developer.
- If both workstreams need the same file, agree on a short integration window or use separate commits that can be cherry-picked cleanly.
- Rebase/merge and run the shared validation suite before handing work to the other developer.
- The integration owner for each phase resolves conflicts; this does not imply permanent ownership of any file.

### Arnab — Public product and audience experience workstream

Tasks:

1. Remove production-visible demo article/video fallbacks. Replace them with clear empty/offline states.
2. Make Bengali the default language when no preference is saved.
3. Complete translation of all static interface text, forms, buttons, validation messages, empty states, error states, footer content, jobs content, map labels, poll labels, and subscription messages.
4. Render dynamic article title, summary, content, source, ticker, poll, district, and video metadata according to the selected language, with safe fallback order `BN → EN → HI` for the Bengali default.
5. Add the canonical motto everywhere appropriate:

   `নিরপেক্ষ খবর, নির্ভীক সাংবাদিকতা | বাংলার খবর, দেশের খবর, বিশ্বের খবর | সত্যের সঙ্গে, মানুষের পাশে।`

6. Make both subscription entry points use the same validated Firestore write path:
   - header subscriber modal
   - bottom newsletter form
7. Collect only the fields required by the consent policy; prevent duplicate active subscriptions; show Bengali/English/Hindi status messages; add unsubscribe/deactivation support.
8. Make careers practical:
   - validate name, email, phone, position, district, pitch, and consent;
   - save an application record;
   - show a tracking/reference number;
   - show a clear privacy and retention notice;
   - explain that shortlisted candidates will be contacted by Gmail for a resume;
   - never promise that the website has received or stored a resume.
9. Complete the district newsroom experience:
   - make every district on the map clickable;
   - open `district.html?district={districtId}`;
   - load the selected district's approved/published articles from Firestore;
   - support Bengali, English, and Hindi district names and article fields;
   - add district search, category filters, pagination/limits, empty states, source attribution, and mobile layout;
   - ensure the homepage map and district page use the same 23-district IDs and GeoJSON source.
10. Keep the GeoJSON/Leaflet map accessible and responsive. Ensure district list, keyboard navigation, tooltips, click navigation, and mobile layout remain usable.
11. Improve public offline/error states so users never see fake articles or misleading “live” claims.
12. Add SEO metadata, canonical URLs, social preview metadata, Bengali metadata, and structured data for articles where appropriate.
13. Test mobile, keyboard, screen-reader labels, slow network, Firebase outage, empty Firestore, invalid image, invalid external link, district routing, and Bengali text rendering.

### Sahitya — Editorial operations, data, worker, and deployment workstream

Tasks:

1. Reconstruct the admin dashboard around the final product:
   - articles;
   - drafts and review queue;
   - approved/published/rejected content;
   - tickers;
   - polls and vote summaries;
   - YouTube/Facebook items and soft-hidden items;
   - live stream;
   - external sources;
   - subscribers;
   - job applications and candidate contact follow-up;
   - reporter submissions;
   - audit log and activity history.
2. Add role-aware navigation and permissions:
   - superadmin: users, roles, rules-sensitive settings, all content, audit logs;
   - editor/admin: review, approve, publish, edit, hide, restore;
   - reporter: own drafts and submissions only;
   - viewer: public pages only.
3. Build a dedicated reporter portal:
   - Firebase email/password login;
   - own draft list;
   - article/poll/ticker submission forms;
   - submit-for-review action;
   - approval/rejection status;
   - admin feedback display;
   - no direct public publication.
4. Implement a safe moderation lifecycle and prevent reporters from changing approved/published records.
5. Add confirmations for destructive actions and preserve audit records for publish, reject, hide, restore, delete, and role changes.
6. Add subscriber and job application lists with search, filters, status changes, candidate contact status, Gmail follow-up notes, export only when privacy-safe, and retention/deletion controls. Do not add resume upload/storage in the first release.
7. Expand Firestore rules and indexes for all new collections. Test them with authenticated and unauthenticated users for every role.
8. Finish worker reliability:
   - idempotent upserts;
   - no reappearance of hidden videos;
   - retry/backoff and timeout handling;
   - source-level error logs;
   - safe RSS metadata extraction;
   - YouTube pagination and live handling;
   - Facebook Page-only integration with approved permissions;
   - no private tokens in the web root.
9. Add worker health reporting: last successful run, last error, item counts, and source status visible to superadmin.
10. Verify the client's Firebase project end-to-end: web app config, Auth providers, Firestore, indexes, rules, service account, API restrictions, authorized domains, and cron credentials.
11. Prepare the Hostinger deployment package and a rollback checklist.

## Resume recommendation for the first release

Do not upload or store resumes in the first release. This avoids unnecessary privacy, malware-scanning, private-download, retention, and Hostinger-storage problems.

Recommended workflow:

1. Candidate submits name, contact information, position, district, portfolio link, and short pitch.
2. Firestore stores the application as a private record.
3. Admin reviews the details in the admin panel.
4. Admin changes `contactStatus` to `contacted` and sends a Gmail message requesting the resume.
5. Candidate replies to Gmail with the PDF.
6. Admin updates `resumeStatus` to `received_by_email` and continues the hiring process outside the public website.

This is practical for a small newsroom and keeps the website from handling sensitive PDF files. The admin panel should provide a “Contact candidate” mailto/Gmail action, contact status, follow-up date, notes, and application status.

Resume upload can be added later only if the hiring volume justifies it. At that point, use private storage outside `public_html`, protected downloads, MIME/signature validation, random filenames, malware scanning, and a retention/deletion policy.

## Additional production suggestions

### Content and copyright

- Maintain a source-rights register for every RSS feed.
- Store source URL, source name, fetch time, license/permission note, and attribution.
- Prefer short metadata summaries and links to the original article.
- Do not automatically copy full protected article text or images.
- Give admins a rights/attribution checklist before approval.
- Add takedown and correction workflows.

### Reliability and security

- Add Firebase App Check if practical.
- Add client-side cooldowns and server-side validation for public submissions.
- Never trust client-supplied `role`, `status`, `createdBy`, or `reviewedBy` fields.
- Use Firebase rules as the authoritative permission layer.
- Keep service accounts, API keys, Meta tokens, worker config, any future resumes, and logs outside `public_html`.
- Add backup/export instructions for Firestore and Hostinger private files.
- Add a maintenance page and a worker failure alert path.

### Editorial usability

- Add bulk moderation actions only after individual actions and audit logging are correct.
- Add preview-before-publish for every article, poll, ticker, and social item.
- Add scheduled publishing and expiry for tickers and polls.
- Add article revisions instead of destructive overwrites.
- Add duplicate URL detection for RSS/manual articles.
- Add a “needs translation” filter.
- Add a “missing image / broken image” admin report.

### Analytics and privacy

- Decide whether analytics are required and obtain consent where required.
- Do not expose subscriber counts as fake local numbers.
- Add privacy policy, terms, cookie/analytics notice, contact/takedown address, and candidate-data retention notice.
- Provide unsubscribe and deletion requests.
- Avoid collecting unnecessary personal data from subscribers, candidates, or reporters.

### Deployment readiness

- Test with the client Firebase project, not the developer project.
- Deploy Firestore rules and indexes before the frontend.
- Verify Firebase Authentication authorized domains for localhost and the final domain.
- Upload only the contents of `migration-static-firebase/` that belong in `public_html`.
- Keep the PHP worker and all secrets outside `public_html`.
- Configure and manually execute the Hostinger cron job.
- Confirm the cron log shows successful RSS and YouTube synchronization.
- Test homepage, district page, videos page, admin page, reporter page, subscriptions, careers, polls, map clicks, image fallback, and mobile layout after deployment.
- Create a rollback copy of the previous public_html package before replacing files.

## Recommended execution phases

### Phase 0 — Contract and test fixtures

Both developers agree on collection fields, statuses, role names, language codes, error behavior, and sample records. Create a small private test dataset in Firebase. No one changes shared field names after Phase 0 without documenting the migration.

### Phase 1 — Parallel foundations

- Arnab: Bengali-first translation framework, motto, production empty states, public form UX, dynamic article language fallback, and district-page/map contract.
- Sahitya: Firestore schemas/rules/indexes, role matrix, audit model, and reporter submission model.

### Phase 2 — Public workflows and editorial workflows

- Arnab: subscriptions, careers UI with Gmail follow-up messaging, public confirmation/error states, district newsroom, and accessibility.
- Sahitya: admin subscriber/application screens, candidate contact tracking, reporter portal, moderation queue, approval/rejection actions.

### Phase 3 — Worker and provider hardening

- Arnab: public display behavior for approved content, provider failure states, source attribution UI, and media fallback.
- Sahitya: worker idempotency, YouTube pagination/live sync, Facebook Page integration, logs, cron, and retry behavior.

### Phase 4 — Integration and deployment rehearsal

Both developers test against the client Firebase project. Arnab tests every public page and language. Sahitya tests every Firebase role, rule, index, worker run, admin action, and Hostinger cron path.

### Phase 5 — Launch gate

Do not deploy until all items below pass:

- no fake/demo content appears;
- Bengali is the default language;
- all visible public strings and dynamic content have language fallbacks;
- subscription records appear in admin;
- job applications appear only to authorized staff and candidate contact tracking works;
- reporter submissions cannot publish directly;
- rejected reporter work remains private and editable by its author;
- approved work appears publicly;
- map clicks work for all 23 districts;
- YouTube hidden/restore behavior works;
- rules deny unauthorized reads/writes;
- worker runs successfully from Hostinger cron;
- no secrets are inside `public_html` or Git;
- rollback and backup procedures are documented.

## Definition of done

The migration is deployment-ready only when a client can operate the public site without editing code, a reporter can submit work without publishing directly, an editor can review and approve it, a superadmin can manage users and private records, the worker can refresh external metadata automatically, and the site remains safe and understandable when services or external media fail.
