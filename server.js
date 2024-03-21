require("dotenv").config();

const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const cors = require("cors");
const pgp = require('pg-promise')();
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const db = pgp({
  user: process.env.DATABASE_USER.toString(),
  password: process.env.DATABASE_PASSWORD.toString(),
  host: process.env.DATABASE_HOST.toString(),
  port: process.env.DATABASE_PORT.toString(),
  database: process.env.DATABASE_NAME.toString()
});

module.exports = db;

app.use(cors());
app.use(express.json());

const port = process.env.NODE_PORT;
let donations = { total: 2000 };

function getFormattedDate() {
  const now = new Date();
  return `[${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}:${now.getHours()}/${now.getMinutes()}/${now.getSeconds()}]`;
}

app.get("/cars", async (_req, res) => {
  const waitingTime = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
  try {
    const cars = await db.any('SELECT photo, license_plate, color, fecha_carro as time, retired FROM car WHERE retired = false');
    res.json(cars);
    console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}] sending server status with waitingtime = ${waitingTime}`);
    await new Promise((resolve) => setTimeout(resolve, waitingTime));
    res.status(200).send();
  }
  catch (error) {
    console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}] [${error.message}]`);
    res.status(500).json({ message: error.message });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");
  const serverIp = os.networkInterfaces().en0[1].address;
  socket.emit("serverDetails", { ip: serverIp, port: port });
});

setInterval(() => {
  io.emit("update_donations", { donations: donations.total });
}, 1000);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});