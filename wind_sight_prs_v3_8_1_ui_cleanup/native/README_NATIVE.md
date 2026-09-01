# WIND SIGHT PRS v3.8.1 — Native BLE Bridge + Shoot UI Cleanup

This package adds the source-level native BLE bridge required for iPhone/iPad and Android. The existing web/PWA UI remains the application core.

## Architecture

- `index.html`: existing WIND SIGHT core + native bridge detection.
- `Capacitor.Plugins.WindSightBLE`: native API expected by the web app.
- `native/ios/WindSightBLEPlugin.swift`: CoreBluetooth reference implementation.
- `native/android/WindSightBLEPlugin.kt`: Android BLE reference implementation.

## Calypso protocol status

The reference native drivers implement Calypso's publicly documented legacy CUPS 4.0 BLE transport:

- Service UUID: `0000180D-1212-EFDE-1523-785FEABCD123`
- Characteristic UUID: `00002A39-1212-EFDE-1523-785FEABCD123`
- Packet: little-endian `speed ×100`, `direction degrees`, `battery mV`, optional check word.

Calypso currently states that the latest Portable Mini/Solar Developer Manual is supplied on request. Production sign-off must compare this implementation against the manual for the exact sensor firmware.

## JavaScript/native contract

Methods:
- `pairCalypso()` -> `{ deviceId, deviceName, protocol }`
- `reconnectCalypso({deviceId})` -> `{ connected, deviceId, deviceName }`
- `disconnectCalypso()`
- `getCalypsoStatus()`

Events:
- `calypsoSample`: `{ speedMps, directionDeg, batteryMv, timestamp, deviceName, protocol }`
- `calypsoState`: `{ status, deviceId, deviceName, error? }`

## Build status

The web/native contract and reference native driver source are included and statically UAT checked. A signed `.ipa`/TestFlight build cannot be produced in this Linux environment because Xcode, an Apple signing identity, and an iOS device are required.
