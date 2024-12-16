document.addEventListener("DOMContentLoaded", async () => {
  const feedContainer = document.getElementById("feed");
  const addPitchButton = document.getElementById("addPitchButton");

  const userRole = getCookie("role");
  const userId = getCookie("id");
  console.log("User Role:", userRole);
  console.log("User ID:", userId);

  // Show the "Add Pitch" button only for founders
  if (userRole === "founder") {
    addPitchButton.style.display = "inline-block";
  }

  // Handle "Add Pitch" button click
  addPitchButton.addEventListener("click", () => {
    window.location.href = `/founder/pitchform?userId=${userId}`;
  });

  try {
    const response = await fetch("/feed");
    const feedData = await response.json();

    feedData.forEach((item) => {
      const feedItem = document.createElement("div");
      let spanId = userRole === "founder" ? "nameElementInvestor" : "nameElement";

      if (userRole === "investor") {
        feedItem.innerHTML = `
          <div class="posts">
            ${item.posts
            .map((post) => `
                <div class="post">
                  <h3>
                    <span id="${spanId}" class="name-element" data-user-id="${item.id}">${item.startUpName}</span>
                  </h3>
                  <p><strong>Founder:</strong> 
                    <span id="${spanId}" class="name-element" data-user-id="${item.id}">${item.firstname} ${item.LastName}</span>
                  </p>
                  <h4>${post.pitchTitle}</h4>
                  <p>${post.pitchDescription}</p>
                  <p><strong>Industry:</strong> ${item.industry}</p>
                  <p><strong>Funding Stage:</strong> ${post.fundingStage}</p>
                  <p><strong>Amount Required:</strong> $${post.amountRequired}</p>
                  <p><strong>Likes:</strong> ${post.likes}</p>
                  <button class="connect-btn" data-user-id="${item.id}">Connect</button>
                </div>
              `)
            .join("")}
          </div>
        `;
      } else if (userRole === "founder") {
        feedItem.innerHTML = `
          <div class="post">
            <h3>
              <span id="${spanId}" class="name-element" data-user-id="${item.id}">${item.firstname} ${item.LastName}</span>
            </h3>
            <p><strong>Investor Type:</strong> ${item.in}</p>
            <p>${item.description}</p>
            <button class="connect-btn" data-user-id="${item.id}">Connect</button>
          </div>
        `;
      }

      feedContainer.appendChild(feedItem);
    });

    // Add event listeners for "Connect" buttons
    document.querySelectorAll(".connect-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const targetUserId = button.getAttribute("data-user-id");

        // Make an API call to handle the connection request
        fetch("/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceUserId: userId,
            targetUserId,
          }),
        })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                alert("Connection request sent successfully!");
                button.disabled = true; // Disable the button
                button.textContent = "Connected"; // Change button text
              } else {
                alert(data.error || "Failed to send connection request.");
              }
            })
            .catch((error) => {
              console.error("Error sending connection request:", error);
              alert("An error occurred while sending the connection request.");
            });
      });
    });

    // Add event listeners to the dynamically created elements
    document.querySelectorAll(".name-element").forEach((element) => {
      element.addEventListener("click", function () {
        const userId = element.getAttribute("data-user-id");
        if (userRole === "founder") {
          window.location.href = `/investor/${userId}`;
        } else if (userRole === "investor") {
          window.location.href = `/founder/${userId}`;
        }
      });
    });
  } catch (error) {
    console.error("Error fetching feed data:", error);
  }
});
