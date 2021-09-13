const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocation = document.querySelector("#send-location");

const $messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;

const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //Height of the new message
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  console.log(newMessageMargin);

  //visible Height
  const visibleHeight = $messages.offsetHeight;

  //Height of message container
  const containerHeight = $messages.scrollHeight;

  //How far i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("clicked!");
//   socket.emit("increment");
// });

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("LT"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (link) => {
  const html = Mustache.render(locationTemplate, {
    username: link.username,
    link: link.url,
    createdAt: moment(link.createdAt).format("LT"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const text = e.target.elements.message.value;
  //   const text = document.querySelector("input").value;
  socket.emit("display", text, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("message delivered!");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $sendLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    socket.emit(
      "location",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocation.removeAttribute("disabled");
        console.log("Location Shared");
      }
    );
  });
});

socket.emit("join", { userName, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
