const role = getCookie("role");
let id = getCookie("id");
const sanitizedUserId = id.replace(/^"|"$/g, "");
console.log(sanitizedUserId);
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
const userId = sanitizedUserId || segments[segments.length - 1];

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
  if (role === "founder") {
    userType = "investor";
  } else {
    userType = "founder";
  }
  console.log(userType);
  const response = await fetch(`/${userType}/getList`);

  const users = await response.json();
  console.log(users);
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

      // Create online/offline status
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

      // Add Progress Button for Investors
      if (role === "investor") {
        const addProgressButton = document.createElement("button");
        addProgressButton.className = "add-progress-button";
        addProgressButton.textContent = "Add Progress";
        addProgressButton.onclick = () => addProgress(user._id); // Pass user ID
        userItem.appendChild(addProgressButton);
      }

      userItem.onclick = () =>
        openChat(user._id, `${user.firstName} ${user.lastName}`);
      userList.appendChild(userItem);
    });
  }
}

function addProgress(userId) {
  // Make an API call to the server to get the form page
  fetch(`/investor/progress/${userId}`, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        // Redirect to the form page
        window.location.href = `/investor/progress/${userId}`;
      } else {
        console.error("Failed to fetch progress form.");
      }
    })
    .catch((error) => console.error("Error:", error));
}

let sender_id = userId;
// the function to open chat window
function openChat(userId, userName) {
  reciver_id = userId;
  document.querySelector(".start-vc").dataset.uniqueUserId = userId;
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

// copy app ID from Agora.io
let APP_ID = "2a53b2e92b544186a80e69d842b35ee7";

let token = null;
let uid = userId;

let client;
let channel;

//let uniqueRoomId = String(reciver_id) + String(userId);
//console.log(uniqueRoomId);
// uniqueRoomId.sort();

let localStream;
let remoteStream;
let peerConnection;
let roomId;
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

// setting vedio audio setting for users
let constraints = {
  video: {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  },
  audio: true,
};

// this function inatlize the vedio call
let init = async (meetID) => {
  // setting unique room meet id
  roomId = meetID;

  if (!roomId) {
    alert("room id not set correctly");
  }

  //using signaling from AGORA
  client = await AgoraRTM.createInstance(APP_ID);
  await client.login({ uid, token });

  // setting the chanel
  channel = client.createChannel(roomId);
  await channel.join();

  channel.on("MemberJoined", handleUserJoined);
  channel.on("MemberLeft", handleUserLeft);

  client.on("MessageFromPeer", handleMessageFromPeer);

  localStream = await navigator.mediaDevices.getUserMedia(constraints);
  document.getElementById("user-1").srcObject = localStream;
};

let handleUserLeft = (MemberId) => {
  document.getElementById("user-2").style.display = "none";
  document.getElementById("user-1").classList.remove("smallFrame");
};

// habdle different type of message from perr like offer // answer // candidcate
let handleMessageFromPeer = async (message, MemberId) => {
  message = JSON.parse(message.text);

  if (message.type === "offer") {
    createAnswer(MemberId, message.offer);
  }

  if (message.type === "answer") {
    addAnswer(message.answer);
  }

  if (message.type === "candidate") {
    if (peerConnection) {
      peerConnection.addIceCandidate(message.candidate);
    }
  }
};

// handling the user when joined
let handleUserJoined = async (MemberId) => {
  console.log("A new user joined the channel:", MemberId);
  createOffer(MemberId);
};

// creat a new connection for peer
let createPeerConnection = async (MemberId) => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;
  document.getElementById("user-2").style.display = "block";

  document.getElementById("user-1").classList.add("smallFrame");

  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    document.getElementById("user-1").srcObject = localStream;
  }

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      client.sendMessageToPeer(
        {
          text: JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
          }),
        },
        MemberId
      );
    }
  };
};

// creat a offer after accepting the call
let createOffer = async (MemberId) => {
  await createPeerConnection(MemberId);

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "offer", offer: offer }) },
    MemberId
  );
};

// createin the answer
let createAnswer = async (MemberId, offer) => {
  await createPeerConnection(MemberId);

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "answer", answer: answer }) },
    MemberId
  );
};

let addAnswer = async (answer) => {
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

let leaveChannel = async () => {
  await channel.leave();
  await client.logout();
};

//function for camer
let toggleCamera = async () => {
  let videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video");

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    document.getElementById("camera-btn").style.backgroundColor =
      "rgb(255, 80, 80)";
  } else {
    videoTrack.enabled = true;
    document.getElementById("camera-btn").style.backgroundColor =
      "rgb(179, 102, 249, .9)";
  }
};

// function for mic
let toggleMic = async () => {
  let audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    document.getElementById("mic-btn").style.backgroundColor =
      "rgb(255, 80, 80)";
  } else {
    audioTrack.enabled = true;
    document.getElementById("mic-btn").style.backgroundColor =
      "rgb(179, 102, 249, .9)";
  }
};

// Event listener for all buttons with the "start-vc" class
document.addEventListener("DOMContentLoaded", () => {
  // Select all buttons with the "start-vc" class
  const buttons = document.querySelectorAll(".start-vc");
  buttons.forEach((button) => {
    console.log(button.dataset.uniqueUserId);
  });
  // let uniqueRoomId = buttons.dataset.uniqueUserId + userId;
  // console.log(uniqueRoomId);
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const startVcButton = document.querySelector(".start-vc");
      const uniqueUserId = startVcButton.getAttribute("data-unique-user-id");

      let uniqueMeetId = uniqueUserId + userId;
      const sortedUniqueMeetId = uniqueMeetId.split("").sort().join("");

      try {
        // Call the /video-call API
        const response = await fetch(`/video-call`, {
          method: "GET",
        });

        if (response.ok) {
          // Render the video.handlebars page
          const pageHtml = await response.text();
          document.body.innerHTML = pageHtml;
          setTimeout(
            () => initializeVideoPage(sortedUniqueMeetId, uniqueUserId),
            1000
          );
          // Call init() after the page is loaded
        } else {
          console.error("Failed to load video call page:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching /video-call API:", error);
      }
    });
  });
});

function initializeVideoPage(uniqueMeetId, uniqueUserId) {
  console.log("Initializing video page with Meeting ID:", uniqueMeetId);

  // Attach event listeners after confirming elements exist
  const cameraButton = document.getElementById("camera-btn");
  const micButton = document.getElementById("mic-btn");
  const leaveButton = document.getElementById("leave-btn");

  if (cameraButton) {
    cameraButton.addEventListener("click", toggleCamera);
  }
  if (micButton) {
    micButton.addEventListener("click", toggleMic);
  }
  if (leaveButton) {
    leaveButton.addEventListener("click", leaveChannel);
  }
  const callerName = "Your Name";
  socket.emit("callUser", {
    meetId: uniqueMeetId,
    callerId: userId,
    recipientId: uniqueUserId,
    callerName: callerName,
  });
  // Call the init function with the unique meet ID
  init(uniqueMeetId);
}

// Function to initialize the video call
