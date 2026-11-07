let port
let inbox = ""
let send = async (method, payload) => {}

form.addEventListener("submit", (e) => {
  e.preventDefault()
  connect()
})

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
    const data = JSON.parse(inbox)
    document.body.innerHTML = "<pre>" + JSON.stringify(data, null, 4) + "</pre>"
    inbox = ""
  } catch(e) {
    console.warn(e)
  }
}
