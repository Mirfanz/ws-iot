const socketIO = require("socket.io");
const http = require("http");
const mqtt = require("mqtt");

const httpServer = http.createServer((req, res) => {
  return res.writeHead(200, "okee");
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

  socket.on("subscribe", (data) => {
    console.log("subscribe", data);
    mqttClient.subscribe(data);
    socket.join(data);
  });

  socket.on("publish", (data) => {
    mqttClient.publish(data.topic, data.message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnect");
  });
});

// mqttClient.subscribe("bytee/6594182a8dffabba4a44d91e");
mqttClient.on("message", (topic, payload) => {
  console.log(topic, payload.toString());
  io.to(topic).emit("mqtt_message", { topic, message: payload.toString() });
});

httpServer.listen(8000, () => {
  console.log("Server Ready at port 8000");
});
