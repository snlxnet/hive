let port
let inbox = ""
let send = async (method, payload) => {}

let typst
let python
let buttons = {}
init()

form.addEventListener("submit", (e) => {
  e.preventDefault()
  connect()
})

async function init() {
  const pkg = await import("https://cdn.jsdelivr.net/npm/typ-js@0.2.0/typ_js.js")
  await pkg.default()
  typst = pkg.TypJs.new()
  python = await loadPyodide()
  document.querySelector("button").textContent = "Connect"
}

async function connect() {
  if (typeof backbone !== "undefined") {
    const ids = devid.value.split(",").map(it => it.trim())
    backbone.central(ids)

    send = (method, payload) => {
      ids.forEach(dev => {
        backbone.send(JSON.stringify({method, payload}) + "\n", dev)
      })
    }

    let first = true
    backbone.onmessage = async (message, _device) => {
      if (first) {
        first = false
        await new Promise(res => setTimeout(res, 1000))
        send("init")
        return
      }
      inbox += message
      tryProcess()
    }
  } else {
    if (!("serial" in navigator)) {
      alert("Unsupported browser")
      return
    }

    port = await navigator.serial.requestPort()
    await port.open({ baudRate: 115200 })

    const textEncoder = new TextEncoderStream();
    textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    send = (method, payload) => writer.write(JSON.stringify({method, payload}) + "\n")
    setTimeout(() => send("init"), 500)

    const textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    new Promise(async () => {
      while (true) {
        const { value } = await reader.read();
        inbox += value
        tryProcess()
      }
    })
  }
}

function tryProcess() {
  try {
    const { method, payload } = JSON.parse(inbox)
    inbox = ""

    if (method === "ui") {
      typst.add("ui.typ", new TextEncoder().encode(payload))
      typst.deps("ui.typ").then(async () => {
        const { svg, err } = await typst.svg("ui.typ")
        document.body.innerHTML = svg || `<pre>${JSON.stringify(err, null, 4)}</pre>`
        console.warn(err)
        document.querySelectorAll("[data-typst-label]")
          .forEach(element => {
            console.log(element)
            function down() {
              buttons[element.dataset.typstLabel] = true
              send("buttons", buttons)
            }
            function up() {
              buttons[element.dataset.typstLabel] = false
              send("buttons", buttons)
            }
            element.onmousedown = down
            element.ontouchstart = down
            element.onmouseup = up
            element.ontouchend = up
            element.style.pointerEvents = "bounding-box"
            up()
          })
      })
    } else {
      document.body.innerHTML = "<pre>" + JSON.stringify(data, null, 4) + "</pre>"
    }
  } catch(e) {
    console.warn(e)
  }
}
