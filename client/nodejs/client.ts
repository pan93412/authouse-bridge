import WebSocket from "ws";

const client = new WebSocket("ws://localhost:3000/ports/364311542bb4638116b9093f5526765ba07cb33e");
client.addEventListener("open", function () {
  let m = "e";
  setInterval(() => {
    m = m === "e" ? "d" : "e";
    client.send(m);
  }, 500);
})
client.addEventListener("message", (data) => console.log(JSON.parse(data.data)));
