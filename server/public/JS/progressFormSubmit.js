document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("submitProgress")
    .addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent the default form submission

      // Collect form data
      const date = document.getElementById("date").value;
      const note = document.getElementById("note").value.trim();
      const action = document.getElementById("action").value.trim();
      const amount = document.getElementById("amount").value;
      const status = document.getElementById("status").value;

      // Validate fields
      if (!date) {
        alert("Date is required.");
        return;
      }
      if (!note) {
        alert("Note is required.");
        return;
      }
      if (!action) {
        alert("Action is required.");
        return;
      }
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
      }
      if (!status) {
        alert("Status is required.");
        return;
      }

      // Extract the 'userId' from the URL path
      const pathSegments = window.location.pathname.split("/"); // Split the URL path into segments
      const userId = pathSegments[pathSegments.length - 1]; // Assuming userId is the last segment in the path

      // Validation
      let isValid = true;

      // Validate date
      if (!validateDate(date)) {
        displayError("date", "Date cannot be in the future.");
        isValid = false;
      }

      if (!userId) {
        alert("User ID is required in the URL.");
        return;
      }
      // Validate note
      if (!checkString(note, "Note")) {
        displayError("note", "Note is required.");
        isValid = false;
      }

      // Validate action
      if (!checkString(action, "Action")) {
        displayError("action", "Action is required.");
        isValid = false;
      }

      // Validate status
      if (!checkString(status, "Status")) {
        displayError("status", "Status is required.");
        isValid = false;
      }

      // If validation fails, stop submission
      if (!isValid) return;

      // Create data object
      const progressData = {
        userId, // Include the userId in the data object
        date,
        note,
        action,
        amount: Number(amount),
        status,
      };

      try {
        // Send POST request with the userId in the URL
        const response = await fetch(`/investor/progress/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(progressData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to submit progress.");
        }

        alert("Progress successfully submitted!");
        // Optionally reset the form
        document.querySelector("form").reset();
      } catch (error) {
        console.error("Error submitting progress:", error);
        alert(`Error: ${error.message}`);
      }
    });
});

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
function checkString(strVal, varName) {
  if (!strVal) return false;
  if (typeof strVal !== "string") return false;
  strVal = strVal.trim();
  if (strVal.length === 0) return false;
  if (!isNaN(strVal)) return false;
  return strVal;
}
function validateDate(date) {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight to compare only the date part
  return selectedDate <= today;
}
