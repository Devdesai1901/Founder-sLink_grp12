document.addEventListener("DOMContentLoaded", function () {
  // Function to get the value of a specific cookie
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const userRole = getCookie("role");
  console.log("User Role:", userRole);

  if (userRole === "founder") {
    document.querySelectorAll("#nameElementInvestor").forEach((element) => {
      element.addEventListener("click", function () {
        const userId = element.getAttribute("data-user-id");
        window.location.href = `/investor/${userId}`;
      });
    });
  } else if (userRole === "investor") {
    document.querySelectorAll("#nameElement").forEach((element) => {
      element.addEventListener("click", function () {
        const userId = element.getAttribute("data-user-id");
        window.location.href = `/founder/${userId}`;
      });
    });
  }
});
