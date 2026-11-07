import json
import time

import usb_cdc
from adafruit_ble import BLERadio
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.nordic import UARTService

class HiveNode:
    def __init__(self):
        self.uart = None
        self.connected = False
        self.was_connected = False
        self.buttons = {}

usb = HiveNode()
ble = HiveNode()

def process(node):
    if node.uart.in_waiting:
        message = json.loads(node.uart.readline())
        print(message)
        node.uart.write(b"Got it.")
        if message["method"] == "init":
            node.connected = True

    if node.connected and not node.was_connected:
        node.uart.write(b"init sequence")
        node.was_connected = True

def tick():
    ble.connected = ble.radio.connected
    process(usb)
    process(ble)

def start_as(name):
    usb.uart = usb_cdc.data
    ble.uart = UARTService()
    adv = ProvideServicesAdvertisement(ble.uart)
    adv.complete_name = name
    ble.radio = BLERadio()
    ble.radio.start_advertising(adv)

start_as("worker-0")
while True:
    tick()
    print('usb', usb.connected)
    print('ble', ble.connected)
    time.sleep(0.5)



