import json
import time

import usb_cdc
from supervisor import runtime, RunReason
from adafruit_ble import BLERadio
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.nordic import UARTService

class HiveNode:
    def __init__(self):
        self.uart = None
        self.connected = False
        self.buttons = {}

usb = HiveNode()
ble = HiveNode()

def send(message):
    text = ""
    if type(message) == dict:
        text = json.dumps({ "method": "data", "payload": message })
    else:
        with open(message) as file:
            text = json.dumps({ "method": "ui", "payload": file.read() })

    if usb.connected:
        usb.uart.write(text)
    if ble.connected:
        ble.uart.write(text)

def process(node):
    if node.uart.in_waiting:
        message = json.loads(node.uart.readline())
        print(message)
        if message["method"] == "init":
            node.connected = True

def tick():
    process(usb)
    process(ble)

def connected():
    tick()
    return usb.connected or ble.connected

def start_as(name):
    usb.uart = usb_cdc.data
    ble.uart = UARTService()
    adv = ProvideServicesAdvertisement(ble.uart)
    adv.complete_name = name
    ble.radio = BLERadio()
    if runtime.run_reason == RunReason.AUTO_RELOAD:
        ble.connected = True
        usb.connected = runtime.usb_connected
        send({"method": "data", "payload": "hi"})
    ble.radio.stop_advertising()
    ble.radio.start_advertising(adv)
