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
        self.buttons = {}

usb = HiveNode()
usb.uart = usb_cdc.data

ble = HiveNode()
ble.uart = UARTService()
ble.radio = BLERadio()
adv = ProvideServicesAdvertisement(ble.uart)
adv.complete_name = "hivetest"
ble.radio.start_advertising(adv)

def process(uart):
    if uart.in_waiting:
        message = json.loads(uart.readline())
        print(message)
        uart.write(b"Got it.")

while True:
    usb.connected = True
    ble.connected = ble.radio.connected

    process(usb.uart)
    process(ble.uart)
    time.sleep(0.1)



