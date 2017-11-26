//
//  RNMovesense.swift
//  RNMovesense
//
//  Created by Albert Nazander on 25/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation
import PromiseKit
import Movesense

@objc(RNMovesense)
class RNMovesense: RCTEventEmitter {
  /// All Events which must be support by React Native.
  lazy var allEvents: [String] = {
    var allEventNames: [String] = []
    
    allEventNames.append("INFO")
    allEventNames.append("GYRO")
    
    return allEventNames
  }()
  
  let movesense = MovesenseService()
  let sampleRate = Int32(13)
  var deviceFound = false
  var uuid: UUID?
  var serial: String?
  
  @objc func initialize() -> Void {
    self.movesense.setHandlers(deviceConnected: { (device) in
      self.sendEvent(withName: "INFO", body: ["type": "CONNECTED"])
    },
                               deviceDisconnected: { (device) in
                                self.sendEvent(withName: "INFO", body: ["type": "DISCONNECTED"])
                                print("Disconnected", device)
    },
                               bleOnOff: { (state) in
                                self.sendEvent(withName: "INFO", body: [
                                  "type": "BLUETOOTH_STATUS",
                                  "state": state
                                ])
                                print("Ble ON / OFF", state)
    })
    self.connect()
  }
  
  func connect() -> Void {
    self.movesense.startScan { (device) in
      print("Device found", device.localName)
      
      self.sendEvent(withName: "INFO", body: [
        "type": "DEVICE_FOUND",
        "localName": device.localName,
        "uuid": device.uuid,
        "serial": device.serial
      ])
      if (device.localName == "Movesense 174630000711") {
//      if (device.localName == "Movesense 174630000650") {
        self.movesense.stopScan()
        if (self.deviceFound) {
          return
        }
        self.deviceFound = true
        self.uuid = device.uuid
        self.serial = device.serial
        
        self.movesense.connectDevice(device.serial)
        self.sendEvent(withName: "INFO", body: [
          "type": "CONNECTING"
        ])
      }
    }
  }
  
  @objc func startListening() -> Void {
    let path = String("\(Movesense.GYRO_PATH)/\(self.sampleRate)")

    self.movesense.subscribe(self.serial!, path: path!,
                         parameters: [:],
                         onNotify: { response in
                          self.sendEvent(withName: "GYRO", body: response.asDict())
    },
                         onError: { (_, path, message) in
                          let resultsDict = [
                            "error": message
                          ]
                          self.sendEvent(withName: "GYRO", body: resultsDict)
    })
  }
  
  @objc func stopListening() -> Void {
    let path = String("\(Movesense.GYRO_PATH)/\(self.sampleRate)")
    
    self.movesense.unsubscribe(self.serial!, path: path!)
  }
  
  @objc func addEvent(_ name: String, location: String) -> Void {
    NSLog("%@ %@ %S", name, location);
  }
  
  @objc open override func supportedEvents() -> [String] {
    return self.allEvents
  }
}
