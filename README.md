Planned dx:

```python
import hive

phone = hive.connect("worker-0")
while not phone.connected:
    pass

phone.set_ui("ui.typ")
phone.download("numpy")
stdout = phone.exec('heavy-compute.py') # runs in pyodide

while True:
    outgoing = { "brightness": 5 }
    phone.send(outgoing)
    
    if phone.buttons.log:
        print("button 'log' pressed")
    hive.tick()
```

```typst
#box(fill: green)[Log to the console] <log>

#let data = json("hive.json")
#rect(width: data.brightness * 1%, height: 5mm)
```
