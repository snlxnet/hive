= Hello from CircuitPython!

#let state = json("hive.json")

#let color = if "buttons" in state and "led" in state.buttons {
  if state.buttons.led {
    olive
  } else {
    gray
  }
} else {
  white
}

#state

#box(
  fill: color,
  inset: 2mm,
)[Test Button] <led>

updated
