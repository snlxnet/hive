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
  const pkg = await import("/npm/typ_js.js")
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
      alert("backbone send" + JSON.stringify({method, payload, ids}))
      const message = JSON.stringify({method, payload}) + "\n"
      const chunks = message.match(/.{0,20}/g)
      ids.forEach(dev => {
        chunks.forEach(chunk => backbone.send(chunk, dev))
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
  const closing = [...inbox.matchAll("}")]
  const start = Array.from(inbox.matchAll('{"method":"')).at(-1)?.index || 0

  for (const { index } of closing) {
    try {
      const slice = inbox.slice(start, index+1)
      console.log({slice})
      const { method, payload } = JSON.parse(slice)
      handle(method, payload)
      inbox = inbox.slice(index+1)
      return
    } catch (_e) {}
  }
}

function handle(method, payload) {
  console.log({method, payload})
  if (method === "ui") {
    typst.add("ui.typ", new TextEncoder().encode(payload))
    render().then(() => send("buttons", buttons))
  } else if (method === "data") {
    typst.add("hive.json", new TextEncoder().encode(JSON.stringify(payload, null, 4)))
    render()
  } else {
    document.body.innerHTML = "<pre>" + JSON.stringify({method, payload}, null, 4) + "</pre>"
  }
}

async function render() {
  return typst.deps("ui.typ").then(async () => {
    const { svg, err } = await typst.svg("ui.typ")
    if (err.length) {
      console.warn(err)
    }
    const eMsg = err.length ? `<pre>${JSON.stringify(err, null, 4)}</pre>` : "No ui sent yet"
    document.body.innerHTML = svg || eMsg
    document.querySelectorAll("[data-typst-label]")
      .forEach(element => {
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
        buttons[element.dataset.typstLabel] = false
      })
  })
}
