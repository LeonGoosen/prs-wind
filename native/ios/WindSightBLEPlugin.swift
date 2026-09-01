import Foundation
import Capacitor
import CoreBluetooth

@objc(WindSightBLEPlugin)
public class WindSightBLEPlugin: CAPPlugin, CAPBridgedPlugin, CBCentralManagerDelegate, CBPeripheralDelegate {
    public let identifier = "WindSightBLEPlugin"
    public let jsName = "WindSightBLE"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "pairCalypso", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reconnectCalypso", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disconnectCalypso", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCalypsoStatus", returnType: CAPPluginReturnPromise)
    ]

    private let serviceUUID = CBUUID(string: "0000180D-1212-EFDE-1523-785FEABCD123")
    private let dataUUID = CBUUID(string: "00002A39-1212-EFDE-1523-785FEABCD123")
    private var central: CBCentralManager!
    private var peripheral: CBPeripheral?
    private var pendingPairCall: CAPPluginCall?
    private var pendingReconnectCall: CAPPluginCall?
    private var requestedId: UUID?

    public override func load() {
        central = CBCentralManager(delegate: self, queue: nil)
    }

    @objc func pairCalypso(_ call: CAPPluginCall) {
        guard central.state == .poweredOn else { call.reject("Bluetooth is not powered on"); return }
        pendingPairCall = call
        requestedId = nil
        notifyListeners("calypsoState", data: ["status": "connecting"])
        central.scanForPeripherals(withServices: [serviceUUID], options: [CBCentralManagerScanOptionAllowDuplicatesKey: false])
    }

    @objc func reconnectCalypso(_ call: CAPPluginCall) {
        guard central.state == .poweredOn else { call.reject("Bluetooth is not powered on"); return }
        guard let raw = call.getString("deviceId"), let uuid = UUID(uuidString: raw) else { call.reject("deviceId is required"); return }
        let known = central.retrievePeripherals(withIdentifiers: [uuid])
        if let p = known.first {
            pendingReconnectCall = call
            connect(p)
        } else {
            requestedId = uuid
            pendingReconnectCall = call
            central.scanForPeripherals(withServices: [serviceUUID], options: [CBCentralManagerScanOptionAllowDuplicatesKey: false])
        }
    }

    @objc func disconnectCalypso(_ call: CAPPluginCall) {
        if let p = peripheral { central.cancelPeripheralConnection(p) }
        peripheral = nil
        call.resolve()
    }

    @objc func getCalypsoStatus(_ call: CAPPluginCall) {
        call.resolve([
            "connected": peripheral?.state == .connected,
            "deviceId": peripheral?.identifier.uuidString ?? "",
            "deviceName": peripheral?.name ?? ""
        ])
    }

    public func centralManagerDidUpdateState(_ central: CBCentralManager) {
        notifyListeners("calypsoState", data: ["status": central.state == .poweredOn ? "idle" : "error", "error": central.state == .poweredOn ? "" : "Bluetooth unavailable"])
    }

    public func centralManager(_ central: CBCentralManager, didDiscover p: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        if let wanted = requestedId, p.identifier != wanted { return }
        central.stopScan()
        connect(p)
    }

    private func connect(_ p: CBPeripheral) {
        peripheral = p
        p.delegate = self
        central.connect(p, options: nil)
    }

    public func centralManager(_ central: CBCentralManager, didConnect p: CBPeripheral) {
        p.discoverServices([serviceUUID])
        let result: [String: Any] = ["connected": true, "deviceId": p.identifier.uuidString, "deviceName": p.name ?? "Calypso", "protocol": "CALYPSO_CUPS4_LEGACY"]
        pendingPairCall?.resolve(result); pendingPairCall = nil
        pendingReconnectCall?.resolve(result); pendingReconnectCall = nil
        notifyListeners("calypsoState", data: ["status": "connected", "deviceId": p.identifier.uuidString, "deviceName": p.name ?? "Calypso"])
    }

    public func centralManager(_ central: CBCentralManager, didFailToConnect p: CBPeripheral, error: Error?) {
        let msg = error?.localizedDescription ?? "Connection failed"
        pendingPairCall?.reject(msg); pendingPairCall = nil
        pendingReconnectCall?.reject(msg); pendingReconnectCall = nil
        notifyListeners("calypsoState", data: ["status": "error", "error": msg])
    }

    public func centralManager(_ central: CBCentralManager, didDisconnectPeripheral p: CBPeripheral, error: Error?) {
        notifyListeners("calypsoState", data: ["status": "idle", "deviceId": p.identifier.uuidString, "deviceName": p.name ?? "Calypso"])
    }

    public func peripheral(_ p: CBPeripheral, didDiscoverServices error: Error?) {
        guard error == nil, let services = p.services else { return }
        for service in services where service.uuid == serviceUUID { p.discoverCharacteristics([dataUUID], for: service) }
    }

    public func peripheral(_ p: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        guard error == nil, let chars = service.characteristics else { return }
        for c in chars where c.uuid == dataUUID {
            p.setNotifyValue(true, for: c)
            if c.properties.contains(.read) { p.readValue(for: c) }
        }
    }

    public func peripheral(_ p: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        guard error == nil, characteristic.uuid == dataUUID, let data = characteristic.value, data.count >= 6 else { return }
        let bytes = [UInt8](data)
        let speedRaw = UInt16(bytes[0]) | (UInt16(bytes[1]) << 8)
        let dirRaw = UInt16(bytes[2]) | (UInt16(bytes[3]) << 8)
        let battMv = UInt16(bytes[4]) | (UInt16(bytes[5]) << 8)
        notifyListeners("calypsoSample", data: [
            "speedMps": Double(speedRaw) / 100.0,
            "directionDeg": Double(dirRaw),
            "batteryMv": Int(battMv),
            "timestamp": Int(Date().timeIntervalSince1970 * 1000),
            "deviceName": p.name ?? "Calypso",
            "protocol": "CALYPSO_CUPS4_LEGACY"
        ])
    }
}
