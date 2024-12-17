// Handle "Add Pitch" button click
document.addEventListener("DOMContentLoaded", async () => {
  pitchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const pitchTitle = document.getElementById("pitchTitle").value;
    const pitchDescription = document.getElementById("pitchDescription").value;
    const fundingStage = document.getElementById("fundingStage").value;
    const amountRequired = document.getElementById("amountRequired").value;

    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const userRole = getCookie("role");
    let userId = getCookie("id");
    console.log("Raw Cookie Value:", getCookie("id"));

    userId = decodeURIComponent(userId || "");
    userId = userId.replace(/^"|"$/g, "");
    console.log("User Role:", userRole);
    console.log("User ID:", userId);

    const pitchData = {
      pitchTitle,
      pitchDescription,
      fundingStage,
      amountRequired,
    };

    try {
      const response = await fetch(`/founder/pitchform?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pitchData),
      });

      if (response.ok) {
        // Handle successful response
        alert("Pitch submitted successfully!");
        window.location.href = `/founder/dashboard`;
      } else {
        // Handle error response
        alert("Failed to submit pitch. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting pitch:", error);
    }
  });
});
