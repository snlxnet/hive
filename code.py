from hive import *

start_as("worker-0")
while not connected():
    pass
print("connected")
send("ui.typ")
# send({"temperature": 21.0})
while True:
    tick()
    print(buttons)
    time.sleep(0.05)

