// Handle "Add Pitch" button click
document.addEventListener("DOMContentLoaded", async () => {
  const pitchForm = document.getElementById("pitchForm");

  // Add event listener for form submission
  pitchForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get input values
    const pitchTitle = document.getElementById("pitchTitle").value.trim();
    const pitchDescription = document
      .getElementById("pitchDescription")
      .value.trim();
    const fundingStage = document.getElementById("fundingStage").value;
    const amountRequired = document
      .getElementById("amountRequired")
      .value.trim();

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach((el) => el.remove());

    // Validation
    let isValid = true;

    // Validate pitch title
    if (!pitchTitle) {
      displayError("pitchTitle", "Pitch title is required.");
      isValid = false;
    }

    // Validate pitch description
    if (!pitchDescription) {
      displayError("pitchDescription", "Pitch description is required.");
      isValid = false;
    }

    // Validate funding stage
    if (!fundingStage) {
      displayError("fundingStage", "Please select a funding stage.");
      isValid = false;
    }

    // Validate pitch title length
    if (!checkLenCharacters("pitchTitle", pitchTitle, "Pitch Title", 5, 100)) {
      isValid = false;
    }

    // Validate pitch description length
    if (
      !checkLenCharacters(
        "pitchDescription",
        pitchDescription,
        "Pitch Description",
        100,
        20000
      )
    ) {
      isValid = false;
    }

    // Validate amount required
    if (!amountRequired || isNaN(amountRequired) || amountRequired < 10000) {
      displayError(
        "amountRequired",
        "Amount required must be at least 10,000."
      );
      isValid = false;
    }

    // If validation fails, stop submission
    if (!isValid) return;

    // Get cookies for user data
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

    // Prepare pitch data
    const pitchData = {
      pitchTitle,
      pitchDescription,
      fundingStage,
      amountRequired: parseInt(amountRequired, 10),
    };

    // Submit pitch to the server
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
        window.location.href = `/founder/dashboard/`;
      } else {
        // Handle error response
        alert("Failed to submit pitch. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting pitch:", error);
    }
  });

  // Function to display error messages
  function displayError(inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorElement = document.createElement("small");
    errorElement.className = "error-message text-danger";
    errorElement.textContent = message;
    inputElement.parentElement.appendChild(errorElement);
  }

  function checkLenCharacters(inputId, input, fieldName, min, max) {
    if (input.length < min || input.length > max) {
      const inputElement = document.getElementById(inputId);
      const errorElement = document.createElement("small");
      errorElement.className = "error-message text-danger";
      errorElement.textContent = `${fieldName} must be between ${min} and ${max} characters long`;
      inputElement.parentElement.appendChild(errorElement);
      return false;
    }
    return true;
  }
});
