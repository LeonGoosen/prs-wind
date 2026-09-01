WIND SIGHT PRS v3.1.1 — Profile Edit Fix

Fixes:
- Existing saved profiles now normalize legacy fields before editing.
- Legacy twist values are migrated correctly into twistValue.
- Legacy BC values are migrated into bcValue.
- Saved ammo calibration data is rehydrated from the latest calibration version when editing.
- If a stored ammo id is missing, the editor falls back to the first ammo profile instead of rendering blank.
- Profile normalization is persisted immediately.
- A visible error is shown if a profile truly cannot be loaded, instead of a blank page.
- Version shown in app header: v3.1.1.

JavaScript syntax: PASS
