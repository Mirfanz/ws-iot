const socketIO = require("socket.io");
const http = require("http");
const mqtt = require("mqtt");

const httpServer = http.createServer((req, res) => {
  return res.writeHead(200, "Websocket Server");
});

const io = new socketIO.Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", , "POST"],
  },
});
const mqttClient = mqtt.connect("mqtt://free.mqtt.iyoti.id:1883");

io.on("connection", (socket) => {
  console.log("Connect " + socket.id);

  socket.on("subscribe", (deviceId) => {
    const topic = "bytee/" + deviceId;
    console.log("subscribe", topic);

    mqttClient.subscribe(topic);
    socket.join(topic);
  });

  socket.on("publish", (data) => {
    const topic = "bytee/" + data.deviceId;
    mqttClient.publish(topic, data.state ? "1" : "0");
    socket.emit("mqtt_message", data);
    socket.to(topic).emit("mqtt_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnect");
  });
});

mqttClient.on("message", (topic, payload) => {
  const message = payload.toString();
  console.log(topic, message);

  // Cek darimana message bearasal
  if (message === "on" || message === "off") {
    // Jika message dari device, Teruskan message ke websocket
    console.log("Signal Dari Device");
    io.to(topic).emit("mqtt_message", { topic, message });
  } else if (message === "0" || message === "1") {
    // Jika message dari website, Biarin aja karena sudah diteruskan oleh websocket
    console.log("Signal Dari Website");
  }
});

const port = 8083;
httpServer.listen(port, () => {
  console.log("Server Ready at port " + port);
});
