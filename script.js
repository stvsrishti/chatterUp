//socket
const socket = io.connect("http://localhost:3000");

//audio
var notificationSound = new Audio("./public/audio/audio.mp3");
notificationSound.load();

// DOM elements
const myPrompt = document.getElementById("my-prompt");
const userName = document.getElementById("name");
const message = document.getElementById("text-message");
const sendMessage = document.getElementById("message-form");

// Display prompt on page load
document.addEventListener("DOMContentLoaded", () => {
  myPrompt.style.display = "flex";
});

// Event: User submits prompt form to join
myPrompt.addEventListener("submit", (event) => {
  event.preventDefault();
  const welcome = document.getElementById("welcome");
  welcome.innerText = "Welcome, " + userName.value;
  welcome.style.display = "block";
  myPrompt.style.display = "none";
  socket.emit("join", userName.value);
});

// Event: Update online users and old messages
socket.on("onlineUsers", (users) => {
  notificationSound.play();
  const onlineUser = document.getElementById("online-user");
  onlineUser.innerHTML = "";
  const count = document.getElementById("count");
  count.innerText = "Online(" + users.length + ")";
  users.forEach((user) => {
    const newUser = document.createElement("div");
    newUser.innerHTML = `   <div class="user">
                            <img src="public/images/1.png" alt="R">
                            <p>${user.name}</p>
                            <span class="online-dot"></span>
                            <p id="${user.id}" class="typing"><p>
        
                    </div>`;
    onlineUser.appendChild(newUser);
  });
});

// Event: Display old messages  when loaded from server
socket.on("joined", (data) => {
  notificationSound.play();
  const messageList = document.getElementById("message-list");
  const map = new Map();
  let i = 1;
  //console.log(data);
  if (userName.value == data.name) {
    data.message.forEach((message) => {
      const divClass =
        message.name == userName.value ? "message-block-user" : "message-block";
      const oldmsg = document.createElement("div");
      const timestamp = new Date(message.time);
      const timeMinutes =
        timestamp.getMinutes() > 9
          ? timestamp.getMinutes()
          : +"0" + timestamp.getMinutes().toString();
      if (!map.get(message.name)) {
        if (i > 4) {
          i = 1;
        }
        map.set(message.name, i++);
      }
      console.log(map);
      oldmsg.innerHTML = `
            <div class=${divClass} >
                <img src="public/images/${map.get(message.name)}.png" alt="pic">
                <div class="message-content">
                    <p class="name" style="margin-bottom: 15px;">${
                      message.name
                    }</p>
                    <p class="message" >${message.message}</p>
                    <p class="timestamp">${timestamp.getHours()}:${timeMinutes}</p>
                </div>
            </div>`;
      messageList.appendChild(oldmsg);
    });
  }

  scrollToBottom();
});

// Event: Typing indicator
message.addEventListener("input", () => {
  socket.emit("typing", userName.value);
});
socket.on("typing", (userId) => {
  if (userId) {
    document.getElementById(userId).innerText = "typing..";
  }
  setTimeout(() => {
    document.getElementById(userId).innerText = "";
  }, 500);
});

// Event: Send message to server
sendMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = { name: userName.value, message: message.value };
  socket.emit("sendMessage", data);
  message.value = "";
});

// Event: Receive and display new message
socket.on("newMessage", (newMessage) => {
  notificationSound.play();
  const messageList = document.getElementById("message-list");
  const msg = document.createElement("div");
  const timestamp = new Date(newMessage.time);
  const timeMinutes =
    timestamp.getMinutes() > 10
      ? timestamp.getMinutes()
      : +"0" + timestamp.getMinutes().toString();
  if (newMessage.name == userName.value) {
    msg.innerHTML = `
        <div class="message-block-user">
            <img src="public/images/1.png" alt="pic">
            <div class="message-content" style="background-color: #6b63e1; color: white;">
                <p class="name" style="color:white; font-weight: bold; margin-bottom: 15px;">${
                  newMessage.name
                }</p>
                <p class="message">${newMessage.message}</p>
                <p class="timestamp">${timestamp.getHours()}:${timeMinutes}</p>
            </div>
        </div>`;
    messageList.appendChild(msg);
  } else {
    msg.innerHTML = `
        <div class="message-block">
            <img src="public/images/2.png" alt="pic">
            <div class="message-content">
                <p class="name">${newMessage.name}</p>
                <p class="message">${newMessage.message}</p>
                <p class="timestamp">Sent ${timestamp.getHours()}:${timeMinutes}</p>
            </div>
        </div>`;
    messageList.appendChild(msg);
  }
  scrollToBottom();
});

// Scroll to bottom of message list
function scrollToBottom() {
  const messageList = document.getElementById("message-list");
  // Scroll the message container to the bottom
  messageList.scrollTop = messageList.scrollHeight;
}
