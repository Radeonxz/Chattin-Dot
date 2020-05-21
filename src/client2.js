//import WebSocket from 'ws';

const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
  console.log("successful connected");

  //send new message from this client to server
  ws.send("Hello server my name is client2.");

  //listen mesage from server
  ws.on("message", (message) => {
    console.log("Got message back from server: ", message);
  });
});
