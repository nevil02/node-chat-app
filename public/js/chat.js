const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("#input-message");
const $submitMessageForm = document.querySelector("#send");

const $sendLocation = document.querySelector("#send-location");

const $messages = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild;

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // height of messages container
    const containerHeight = $messages.scrollHeight;

    // how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }

};

socket.on("message", (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("hh:mm A")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("locationMessage", (locationMessage) => {
    const html = Mustache.render(locationTemplate, {
        username: locationMessage.username,
        locationURL: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format("hh:mm A")
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    console.log(users);

    document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    $submitMessageForm.setAttribute("Disabled", "Desibled");

    // const message = document.querySelector("#input").value;
    const message = e.target.elements.message.value;
    socket.emit("sendMessage", message, (error) => {
        $submitMessageForm.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log("The message was delivered");
    });
});

$sendLocation.addEventListener("click", () => {
    $sendLocation.setAttribute("disabled", "disabled");

    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser!");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, (error) => {

            $sendLocation.removeAttribute("disabled");

            if (error) {
                return console.log(error);
            }
            console.log("Location shared");
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});