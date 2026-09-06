# WIND SIGHT PRS v3.8.5 — Bluefy / Calypso Mini Web BLE

## Baseline
This build is based on **v3.8.4 Shoot Range Card Diagnostics**, the latest web-app feature baseline in the thread. The later v3.9.0 artifact is an iOS/TestFlight packaging branch whose bundled web core predates the v3.8.4 SHOOT/Range Card changes, so it was not used as the UI baseline.

## Identified connection issue
The v3.8.4 browser path filtered discovery only by the older CUPS 4.0 vendor UUID:
- service `0000180d-1212-efde-1523-785feabcd123`
- characteristic `00002a39-1212-efde-1523-785feabcd123`

That can hide an Ultrasonic Portable Mini from Bluefy's chooser if the Mini advertises the later Portable Mini/Solar profile instead.

A Calypso-authored Ultrasonic Portable Solar & Mini Developer Manual (mirrored online; current Calypso site says the latest developer manual is supplied on request) documents these Portable Mini/Solar paths:
- Device Information: `0x180A`
  - Manufacturer `0x2A29`
  - Model `0x2A24` (example UP10)
  - Firmware `0x2A26`
- Combined data service: `0x180D`, notify characteristic `0x2A39`
  - speed: uint16 little-endian / 100 m/s
  - direction: uint16 little-endian degrees
  - battery: 1 byte x 10 percent
- Environmental Sensing: `0x181A`
  - speed `0x2A72`: uint16 little-endian / 100 m/s
  - direction `0x2A73`: uint16 little-endian / 100 degrees
- Battery service: `0x180F`, characteristic `0x2A19` (0-100%)

The older CUPS 4.0 custom UUID + mV packet remains supported as a fallback.

## Changes
1. **PAIR / BROAD SCAN** uses Web Bluetooth `acceptAllDevices:true` with user selection. This prevents a service-advertisement filter from hiding the Mini in Bluefy.
2. **STRICT MINI SCAN** remains available for service/name-filtered discovery.
3. After selection, WIND SIGHT connects to GATT and verifies Calypso identity using Device Information (manufacturer/model/name) before decoding standard 0x180D/0x181A data.
4. Unknown devices are rejected with `UNSUPPORTED_PROTOCOL`; arbitrary packets are never interpreted as wind.
5. Added support for:
   - Mini 0x180D / 0x2A39 combined notifications
   - Mini 0x181A / 0x2A72 + 0x2A73 Environmental Sensing notifications
   - standard 0x180F / 0x2A19 battery
   - legacy CUPS 4.0 custom UUID fallback
6. Added packet length/range checks and malformed-packet rejection.
7. Added connection-state diagnostics for browser capability, chooser, selection, GATT connection, identity, services, notification startup, no readings, stale readings, disconnect, and errors.
8. Added **COPY DIAGNOSTICS** with app version, transport, selected device name, model/firmware when available, protocol, services and failure stage. Full device IDs are not exposed.
9. Direction remains excluded from the model until the reference bearing is configured.
10. Existing native BLE branch, manual entry, workflows, localStorage key, IndexedDB name/schema and one-decimal wind-hold formatting are preserved.

## Physical validation status
**Not yet physically validated** against the user's iPhone + Bluefy + Ultrasonic Portable Mini. The build is ready for that test, but no successful hardware connection is claimed.

If broad scan shows the Mini but WIND SIGHT reports `UNSUPPORTED_PROTOCOL`, copy the diagnostics and provide the Anemotracker/Configurator device-information screen showing exact model and firmware.
