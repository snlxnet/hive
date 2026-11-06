
import json
import time

import usb_cdc
from adafruit_ble import BLERadio
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.nordic import UARTService

class HiveNode:
    def __init__(self):
        self.uart = None
        self.buttons = {}

usb = usb_cdc.data
ble = BLERadio()
nodes = {}

nodes["voyager1"] = HiveNode()

while True:
    for adv in ble.start_scan(ProvideServicesAdvertisement, timeout=0.1):
        if UARTService not in adv.services:
            continue

        name = adv.complete_name
        if name not in nodes.keys():
            continue

        if nodes[name].uart is not None:
            continue

        try:
            conn = ble.connect(adv)
            nodes[name].uart = UARTService(conn)
            print("Connected to", name)
        except Exception as e:
            print("Connect failed for", name, ":", e)
    ble.stop_scan()
    
    if usb and usb.in_waiting:
        message = json.loads(usb.readline())
        if message["method"] == "init":
            name = message["payload"]
            nodes[name] = HiveNode()
            nodes[name].uart = usb
        usb.write(b"Got it.")

    for name, node in nodes.items():
        print(name, node.uart)
    time.sleep(0.1)


