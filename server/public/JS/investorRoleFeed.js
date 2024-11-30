document.addEventListener("DOMContentLoaded", function () {
  const nameElement = document.getElementById("nameElementInvestor");

  nameElement.addEventListener("click", function () {
    const userId = nameElement.getAttribute("data-user-id");

    // Perform a GET request to navigate to the new page
    window.location.href = `/investor/${userId}`;
  });
});
