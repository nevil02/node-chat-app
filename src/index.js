const path = require("path");
const http = require("http");
const express = require("express");
const socket = require("socket.io");
const badWordsFilter = require("bad-words");

const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);

const io = socket(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
    // socket.emit -> send message to specific client only
    // io.emit -> send message to everyone
    // socket.broadcast.emit -> send message to everyone except specific client
    // io.to.emit -> send message to everyone in the room
    // socket.brodcast.to.emit -> send message to everyone in the room except specific client

    socket.on("join", (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit("message", generateMessage("Admin", "Welcome"));
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined`));
        io.to(user.room).emit("roomData", {
           room: user.room,
           users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on("sendMessage", (message, callback) => {

        const user = getUser(socket.id);

        const wordsFilter = new badWordsFilter();

        if (wordsFilter.isProfane(message)) {
            return callback("Profanity is not allowed");
        }

        io.to(user.room).emit("message", generateMessage(user.username, message)); // message to every client
        // socket.emit("message", message); //message to its self
        callback("delivered");
    });

    socket.on("sendLocation", (location, callback) => {
        const user = getUser(socket.id);
        console.log(user);
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long}`));
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit("message", generateMessage("Admin",`${user.username} has left`));
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log("App - running - " + port);
});