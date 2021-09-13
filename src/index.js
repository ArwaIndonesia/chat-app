const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/message.js");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInroom,
} = require("./utils/users.js");
const { get } = require("mongoose");

const app = new express();
const server = http.createServer(app);

const io = socketio(server);
const port = process.env.PORT || 5000;
const publicPath = path.join(__dirname, "../public");

let count = 0;

io.on("connection", (socket) => {
  console.log("New WebSocket connection");
  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count);
  //     io.emit("countUpdated", count);
  //   });

  socket.on("join", ({ userName, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, userName, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.userName} has joined`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInroom(user.room),
    });
  });

  socket.on("display", (text, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(text)) {
      return callback("Profanity is not allowed!");
    }
    io.to(user.room).emit("message", generateMessage(user.userName, text));
    callback();
  });
  socket.on("location", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.userName,
        `http://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.userName} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInroom(user.room),
      });
    }
  });
});

app.use(express.static(publicPath));
server.listen(port, () => {
  console.log("Server is up on port " + port);
});

// app.get("/chat", async (req, res) => {
//   res.render("index.html", {
//     title: "Chat App",
//   });
// });
