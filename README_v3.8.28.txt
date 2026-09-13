WIND SIGHT PRS v3.8.28 — Update Flow Hotfix

Purpose
- Fixes the internal APP_VERSION mismatch that prevented v3.8.27 service-worker installation.
- Keeps the update screen live while an update installs instead of leaving a stale “downloading” message.
- Does not change environmental summary math, legacy firing-solution math, saved-data schema, or user data.

Deployment
Deploy to the same GitHub/Cloudflare Worker and hostname. Do not clear Safari data or remove the Home Screen app.
