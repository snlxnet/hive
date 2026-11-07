from hive import *
import board
import digitalio

led = digitalio.DigitalInOut(board.LED)
led.direction = digitalio.Direction.OUTPUT

print("prep")
start_as("worker-0")
print("started")
while not connected():
    tick()
print("connected")
time.sleep(1)
state = {"temperature": 21}
send(state)
send("ui.typ")
print("ui sent")
while True:
    tick()
    state["buttons"] = buttons
    print(state)
    try:
        led.value = buttons["led"]
    except:
        pass
    # time.sleep(0.05)

