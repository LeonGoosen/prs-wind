package com.zealtech.windsight

import android.Manifest
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.Build
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.UUID

@CapacitorPlugin(
    name = "WindSightBLE",
    permissions = [
        Permission(strings = [Manifest.permission.BLUETOOTH_SCAN], alias = "scan"),
        Permission(strings = [Manifest.permission.BLUETOOTH_CONNECT], alias = "connect")
    ]
)
class WindSightBLEPlugin : Plugin() {
    private val serviceUuid = UUID.fromString("0000180d-1212-efde-1523-785feabcd123")
    private val dataUuid = UUID.fromString("00002a39-1212-efde-1523-785feabcd123")
    private var gatt: BluetoothGatt? = null
    private var pendingCall: PluginCall? = null
    private var wantedAddress: String? = null

    private val manager get() = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val adapter get() = manager.adapter

    @PluginMethod
    fun pairCalypso(call: PluginCall) { pendingCall = call; wantedAddress = null; startScan() }

    @PluginMethod
    fun reconnectCalypso(call: PluginCall) {
        val id = call.getString("deviceId") ?: return call.reject("deviceId is required")
        pendingCall = call; wantedAddress = id
        try { connect(adapter.getRemoteDevice(id)) } catch (e: Exception) { startScan() }
    }

    @PluginMethod
    fun disconnectCalypso(call: PluginCall) { gatt?.disconnect(); gatt?.close(); gatt = null; call.resolve() }

    @PluginMethod
    fun getCalypsoStatus(call: PluginCall) {
        val out = JSObject(); out.put("connected", gatt != null); out.put("deviceId", gatt?.device?.address ?: ""); out.put("deviceName", deviceName(gatt?.device)); call.resolve(out)
    }

    private fun startScan() {
        if (Build.VERSION.SDK_INT >= 31 && (getPermissionState("scan") != PermissionState.GRANTED || getPermissionState("connect") != PermissionState.GRANTED)) {
            requestAllPermissionsForCall(pendingCall, "permissionsCallback"); return
        }
        notifyState("connecting")
        val filter = ScanFilter.Builder().setServiceUuid(android.os.ParcelUuid(serviceUuid)).build()
        adapter.bluetoothLeScanner.startScan(listOf(filter), ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build(), scanCallback)
    }

    @PermissionCallback
    private fun permissionsCallback(call: PluginCall) { if (getPermissionState("scan") == PermissionState.GRANTED && getPermissionState("connect") == PermissionState.GRANTED) startScan() else call.reject("Bluetooth permission denied") }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            if (wantedAddress != null && result.device.address != wantedAddress) return
            adapter.bluetoothLeScanner.stopScan(this); connect(result.device)
        }
    }

    private fun connect(device: BluetoothDevice) {
        gatt?.close(); gatt = device.connectGatt(context, false, callback, BluetoothDevice.TRANSPORT_LE)
    }

    private val callback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(g: BluetoothGatt, status: Int, newState: Int) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                gatt = g; g.discoverServices();
                val out = JSObject(); out.put("connected", true); out.put("deviceId", g.device.address); out.put("deviceName", deviceName(g.device)); out.put("protocol", "CALYPSO_CUPS4_LEGACY")
                pendingCall?.resolve(out); pendingCall = null; notifyState("connected", g.device)
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) { notifyState("idle", g.device); g.close(); if (gatt === g) gatt = null }
        }
        override fun onServicesDiscovered(g: BluetoothGatt, status: Int) {
            val c = g.getService(serviceUuid)?.getCharacteristic(dataUuid) ?: return
            g.setCharacteristicNotification(c, true)
            c.descriptors.firstOrNull()?.let { d -> d.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE; g.writeDescriptor(d) }
            g.readCharacteristic(c)
        }
        @Deprecated("Deprecated in Java")
        override fun onCharacteristicChanged(g: BluetoothGatt, c: BluetoothGattCharacteristic) { parse(g.device, c.value) }
        override fun onCharacteristicChanged(g: BluetoothGatt, c: BluetoothGattCharacteristic, value: ByteArray) { parse(g.device, value) }
    }

    private fun parse(device: BluetoothDevice, value: ByteArray) {
        if (value.size < 6) return
        val b = ByteBuffer.wrap(value).order(ByteOrder.LITTLE_ENDIAN)
        val speed = (b.short.toInt() and 0xffff) / 100.0
        val dir = (b.short.toInt() and 0xffff).toDouble()
        val mv = b.short.toInt() and 0xffff
        val out = JSObject(); out.put("speedMps", speed); out.put("directionDeg", dir); out.put("batteryMv", mv); out.put("timestamp", System.currentTimeMillis()); out.put("deviceName", deviceName(device)); out.put("protocol", "CALYPSO_CUPS4_LEGACY")
        notifyListeners("calypsoSample", out)
    }

    private fun notifyState(status: String, device: BluetoothDevice? = null) { val o = JSObject(); o.put("status", status); o.put("deviceId", device?.address ?: ""); o.put("deviceName", deviceName(device)); notifyListeners("calypsoState", o) }
    private fun deviceName(d: BluetoothDevice?): String = try { d?.name ?: "Calypso" } catch (_: SecurityException) { "Calypso" }
}
