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
        self.buf = b""
        self.connected = False

usb = HiveNode()
ble = HiveNode()
buttons = {}

def send(message):
    text = ""
    if type(message) == dict:
        text = json.dumps({ "method": "data", "payload": message })
    else:
        with open(message) as file:
            text = json.dumps({ "method": "ui", "payload": file.read() })

    if usb.connected:
        usb.uart.write(text+"\n")
    if ble.connected:
        ble.uart.write(text+"\n")

def process(node):
    while node.uart.in_waiting:
        node.buf += node.uart.read(1)
        lines = str(node.buf, 'utf-8').split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue
            try:
                message = json.loads(line)
                print(message)
                node.buf = b""
                if message["method"] == "init":
                    node.connected = True
                elif message["method"] == "buttons":
                    buttons.update(message["payload"])
            except:
                print("chunk", str(node.buf, 'utf-8'), 'end')

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
        usb.connected = runtime.usb_connected
    ble.radio.stop_advertising()
    ble.radio.start_advertising(adv)
