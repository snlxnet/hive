main()

function set(key, value) {
  const element = findLabel(key)

  if (typeof value === "string" || element instanceof SVGTextElement) {
    element.textContent = value
  } else if (typeof value === "number") {
    showChild(element, value)
  } else if (typeof value === "boolean") {
    element.style.display = value ? "inline" : "none"
  }
}

function sub(key, hold, release) {
  const element = findLabel(key)
  element.addEventListener("mousedown", hold)
  element.addEventListener("mouseup", release)
  element.addEventListener("touchstart", hold)
  element.addEventListener("touchend", release)
  element.style.pointerEvents = "bounding-box"
}

function spin(key, duration=60) {
  const element = findLabel(key)
  element.style.transformOrigin = "center"
  element.style.transformBox = "fill-box"
  element.style.animation = duration + "s linear 0s infinite normal none running spin"
}

function showChild(parent, idx) {
  Array.from(parent.children)
    .reverse()
    .map((it, curr) =>
      it.style.display = (curr+1 === idx) ? "inline" : "none"
    )
}

function findLabel(label = "") {
  const root = document.body
  const value = label ? `="${label}"` : "";

  return root.querySelector(`[data-typst-label${value}]`) ||
    root.querySelector(`[inkscape\\:label${value}]`) ||
    root.querySelector(`svg [id${value}]`)
}

async function main() {
  const res = await fetch("/test-ui.svg")
  const svg = await res.text()
  document.body.innerHTML = svg
  spin("bee")
  sub("tab1", () => set("tabs", 1))
  sub("tab2", () => set("tabs", 2))
  sub("tab3", () => set("tabs", 3))
  set("board_name", "javascript :)")
  set("tabs", 1)
}
