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

// todo add spin fn

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
}
