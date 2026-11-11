Planned dx:

```python
import hive

hive.run("name")

while not hive.connected:
    hive.tick()

hive.state.board_name = "circuitpy"
stdout = hive.exec('remote.py') # runs in pyodide, dependencies are specified with uv's script syntax

while True:
    hive.tick()
    hive.state.brightness = 5
    if hive.buttons.log:
        print("button 'log' is being held")
```

With `ui.svg` being used for the UI
