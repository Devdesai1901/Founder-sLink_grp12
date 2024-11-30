const role = getCookie("role");

// event listnet to  trigeer the main function
document.addEventListener("DOMContentLoaded", async () => {
  // Call fetchUsers to populate the user list
  await fetchUsers();
});

// temp function to get the data from the cookie
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

// taking the login user id from the url
const path = window.location.pathname;
const segments = path.split("/");
const userId = segments[segments.length - 1];

// reciver id
let reciver_id;
// client side socket declaration
var socket = io("/user-namespace", {
  auth: {
    token: userId,
  },
});

// fetching list of chat for current user login
async function fetchUsers() {
  let userType = "";
  if (role === "Founder") {
    userType = "investor";
  } else {
    userType = "founder";
  }

  const response = await fetch(`/${userType}/getList`);

  const users = await response.json();

  const userList = document.querySelector(".user-list");
  userList.innerHTML = "";

  if (users.length > 0) {
    users.forEach((user) => {
      const userItem = document.createElement("div");
      userItem.className = "user-item";
      userItem.innerHTML = `
          <img src="${
            user.profilePicture || "/public/assests/user.png"
          }" alt="Profile Picture">
          <span>${user.firstName} ${user.lastName}</span>
        `;
      let supElement = document.createElement("div");
      if (user.is_online == "1") {
        supElement = document.createElement("sup");
        supElement.className = "online-status";
        const dynamicId = `status-${user._id}`;
        supElement.id = dynamicId;
        supElement.innerHTML = "Online";
      } else {
        supElement = document.createElement("sup");
        supElement.className = "offline-status";
        const dynamicId = `status-${user._id}`;
        supElement.id = dynamicId;
        supElement.innerHTML = "Offline";
      }
      userItem.appendChild(supElement);
      userItem.onclick = () =>
        openChat(user._id, `${user.firstName} ${user.lastName}`);
      userList.appendChild(userItem);
    });
  }
}

let sender_id = userId;
// the function to open chat window
function openChat(userId, userName) {
  reciver_id = userId;

  document.getElementById("chatUserName").textContent = userName;
  document.getElementById("chatWindow").classList.remove("hidden");

  socket.emit("existsChat", { sender_id: sender_id, receiver_id: reciver_id });
}

// function to close chat window
function closeChat() {
  document.getElementById("chatWindow").classList.add("hidden");
}

//updateing online status of the user
socket.on("getOnlineUser", function (data) {
  const userId = data.user_id;
  const dynamicId = `status-${userId}`;
  const statusElement = document.getElementById(dynamicId);

  if (statusElement) {
    statusElement.classList.add("online-status"); // Example of adding an "online" class
    statusElement.classList.remove("offline-status");
    statusElement.textContent = "Online"; // Optional: Update text
  }
});

//update offline status user
socket.on("getOfflineUser", function (data) {
  const userId = data.user_id;
  const dynamicId = `status-${userId}`;
  const statusElement = document.getElementById(dynamicId);

  if (statusElement) {
    statusElement.classList.add("offline-status"); // Example of adding an "online" class
    statusElement.classList.remove("online-status");
    statusElement.textContent = "offline"; // Optional: Update text
  }
});

// chat saving of user
$("#chat-form").submit(function (event) {
  event.preventDefault();

  let message = $("#messageInput").val();
  message = message.trim();
  if (message.length !== 0) {
    $.ajax({
      url: "/save-chat/",
      type: "POST",
      data: {
        sender_id: userId,
        receiver_id: reciver_id,
        message: message,
      },
      success: function (response) {
        if (response.success) {
          $("#messageInput").val("");
          let chat = response.data.message;
          let html = `<div class="current-user-chat" id="current-user-chat">
            <h5> 
            ${chat} 
            </h5>
          </div>
        `;

          $("#chat-container").append(html);
          socket.emit("newChat", response.data);
        } else {
          alert(res.message);
        }
      },
    });
  }
});

// broadcasting  chat to other side  user
socket.on("loadNewChat", function (data) {
  if (userId === data.receiver_id && reciver_id === data.sender_id) {
    let html = `<div class="distance-user-chat" id="distance-user-chat">
    <h5> 
    ${data.message}   
    </h5>
     
  </div>
  `;
    $("#chat-container").append(html);
  }
});

//load old chats
socket.on("loadChats", function (data) {
  $("#chat-container").html("");
  let chats = data.chats;
  let html = "";
  for (let x = 0; x < chats.length; x++) {
    let addClass = "";

    if (chats[x].sender_id === userId) {
      addClass = "current-user-chat";
    } else {
      addClass = "distance-user-chat";
    }

    html += `<div class=${addClass} >
          <h5>${chats[x].message}</h5>
        </div>`;
  }
  $("#chat-container").append(html);
});
