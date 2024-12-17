// // const form = document.getElementById('founderForm');

// // form.addEventListener('submit', async (e) => {
// //   e.preventDefault();

// //   const formData = new FormData(form);
// //   const data = Object.fromEntries(formData.entries());

// //   try {
// //     const response = await fetch('/founder', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(data),
// //     });
// //     const { message } = await response.json();
// //     alert(message);
// //   } 
// //   catch (error) {
// //     alert('Error submitting form');
// //     console.error('Submission error:', error);
// //   }
// // });

// document.addEventListener('DOMContentLoaded', async () => {
//   const userType = getCookie("role");
//   let userId = getCookie("id");
//   let sanitizedUserId = decodeURIComponent(userId);
//  sanitizedUserId = userId.replace(/^"|"$/g, "");
//   console.log(sanitizedUserId);
  
//   //console.log(sanitizedUserId);
//   //const userType = localStorage.getItem('userType');
//   //const userId = localStorage.getItem('userId');

//   const form = document.getElementById('profileForm');

//   if (!userType || !sanitizedUserId) {
//     alert('User information is missing');
//     return;
//   }

//   try {
//     // Fetch existing user data from the server
//     // const response = await fetch(`/profile/${userType}/${sanitizedUserId}`);
//     // // if (!response.ok) {
//     //   throw new Error('Failed to fetch user data');
//     // }

//     const userData = await response.json();

//     // Populate form fields with existing data
//     form.startupName.value = userData.startupName || '';
//     form.startupIndustry.value = userData.startupIndustry || '';
//     form.companyDescription.value = userData.companyDescription || '';
//     form.establishYear.value = userData.establishYear || '';
//     form.fundingStage.value = userData.fundingStage || '';
//     form.amountToRaiseFund.value = userData.amountToRaiseFund || '';
//     form.tam.value = userData.tam || '';
//     form.sam.value = userData.sam || '';
//     form.companyReserves.value = userData.companyReserves || '';
//     form.website.value = userData.website || '';
//     form.linkedIn.value = userData.linkedIn || '';
//     form.twitter.value = userData.twitter || '';
//     console.log('startupName: ', userData.startupName);

//   } catch (error) {
//     console.error('Error loading user data:', error);
//     alert('Failed to load profile data');
//   }

//   // Form submission to save updates
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const updatedData = {
//       startupName: form.startupName.value,
//       startupIndustry: form.startupIndustry.value,
//       companyDescription: form.companyDescription.value,
//       establishYear: form.establishYear.value,
//       fundingStage: form.fundingStage.value,
//       amountToRaiseFund: form.amountToRaiseFund.value,
//       tam: form.tam.value,
//       sam: form.sam.value,
//       companyReserves: form.companyReserves.value,
//       website: form.website.value,
//       linkedIn: form.linkedIn.value,
//       twitter: form.twitter.value
//     };

//     try {
//       const response = await fetch(`/founder/foundersPofileForm`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updatedData),
//       });

//       const result = await response.json();
//       alert(result.message || 'Profile updated successfully!');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Error saving profile data');
//     }
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("founderForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Form data validation
    const startupName = document.getElementById("startupName").value.trim();
    const startupIndustry = document.getElementById("startupIndustry").value.trim();
    const companyDescription = document.getElementById("companyDescription").value.trim();
    const establishYear = document.getElementById("establishYear").value.trim();
    const fundingStage = document.getElementById("fundingStage").value;
    const amountToRaiseFund = document.getElementById("amountToRaiseFund").value.trim();
    const tam = document.getElementById("tam").value.trim();
    const sam = document.getElementById("sam").value.trim();
    const companyReserves = document.getElementById("companyReserves").value.trim();
    const website = document.getElementById("website").value.trim();
    const linkedIn = document.getElementById("linkedIn").value.trim();
    const twitter = document.getElementById("twitter").value.trim();

    // Basic validation
    if (!startupName || !startupIndustry || !establishYear || !fundingStage || !amountToRaiseFund) {
      alert("Please fill out all required fields.");
      return;
    }

    if (companyDescription.length > 2000) {
      alert("Company description cannot exceed 2000 characters.");
      return;
    }

    if (isNaN(establishYear) || establishYear < 1800 || establishYear > new Date().getFullYear()) {
      alert("Please enter a valid year for establishment.");
      return;
    }

    if (isNaN(amountToRaiseFund) || amountToRaiseFund <= 0) {
      alert("Please enter a valid amount to raise funds.");
      return;
    }

    // Create the payload
    const payload = {
      startupName,
      startupIndustry,
      companyDescription,
      establishYear,
      fundingStage,
      amountToRaiseFund,
      tam: tam || null, // Optional fields
      sam: sam || null,
      companyReserves: companyReserves || null,
      website: website || null,
      linkedIn: linkedIn || null,
      twitter: twitter || null,
    };

    try {
      // Submit the form data to the server
      const response = await fetch("/founder/foundersPofileForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Form submitted successfully!");
        form.reset(); // Clear the form
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "An error occurred while submitting the form."}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit the form. Please try again later.");
    }
  });
});
