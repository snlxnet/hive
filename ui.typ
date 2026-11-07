#set page(width: 7cm, height: 14cm)

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

#box(
  fill: color,
  inset: 2mm,
)[LED Button] <led>

#box(
  fill: blue,
  inset: 2mm,
)[Test Button] <test>

#if "buttons" in state {
  state.buttons
}

