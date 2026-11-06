let port
let inbox = ""
let send = async (message) => {}

form.addEventListener("submit", (e) => {
  e.preventDefault()
  connect()
})

async function connect() {
  if (typeof backbone !== "undefined") {
    backbone.central(devid.value.split(",").map(it => it.trim()))

    send = (msg) => backbone.send(msg + "\n")

    backbone.onmessage = (message, _device) => {
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
    send = (msg) => writer.write(msg + "\n")

    const textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    while (true) {
      const { value } = await reader.read();
      inbox += value
      tryProcess()
    }
  }
}

function tryProcess() {
  console.log(inbox)
  inbox = ""
}
