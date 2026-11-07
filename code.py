from hive import *

start_as("worker-0")
while not connected():
    pass
print("connected")
state = {"temperature": 21}
send(state)
send("ui.typ")
while True:
    tick()
    state["buttons"] = buttons
    send(state)
    time.sleep(0.1)

