function set(key, value) {
  const el = findLabel(key)

  if (typeof value === "string" || el instanceof SVGTextElement) {
    el.textContent = value
  } else if (typeof value === "number") {
    showChild(el, value)
  } else if (typeof value === "boolean") {
    el.style.display = value ? "inline" : "none"
  }
}

function sub(key, hold, release) {
  const el = findLabel(key)
  el.addEventListener("mousedown", hold)
  el.addEventListener("mouseup", release)
  el.addEventListener("touchstart", hold)
  el.addEventListener("touchend", release)
  el.style.pointerEvents = "bounding-box"
}

function spin(key, duration=60) {
  const el = findLabel(key)
  el.style.transformOrigin = "center"
  el.style.transformBox = "fill-box"
  el.style.animation = duration + "s linear 0s infinite normal none running spin"
}

function showChild(parent, idx) {
  Array.from(parent.children)
    .reverse()
    .map((el, curr) =>
      el.style.display = (curr+1 === idx) ? "inline" : "none"
    )
}

function findLabel(label = "") {
  const root = document.body
  const value = label ? `="${label}"` : "";

  const element = root.querySelector(`[data-typst-label${value}]`) ||
    root.querySelector(`[inkscape\\:label${value}]`) ||
    root.querySelector(`svg [id${value}]`)

  if (!element) {
    throw new Error(`Element ${label} not found`)
  }

  return element
}

