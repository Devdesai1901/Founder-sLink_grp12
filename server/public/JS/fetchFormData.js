document.addEventListener('DOMContentLoaded', async () => {
    const userType = getCookie("role");
    let userId = getCookie("id");
    const sanitizedUserId = userId.replace(/^"|"$/g, "");
    console.log(sanitizedUserId);
    //const userType = localStorage.getItem('userType'); // 'founder' or 'investor'
    //const userId = localStorage.getItem('userId');     // User ID stored in local storage
  
    const form = document.getElementById('profileForm');
  
    if (!userType || !sanitizedUserId) {
      alert('User information is missing');
      return;
    }
  
    try {
      // Fetch existing user data from the server
      const response = await fetch(`/profile/${userType}/${sanitizedUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
  
      const userData = await response.json();
  
      // Populate form fields with existing data
      form.name.value = userData.name || '';
      form.email.value = userData.email || '';
      form.bio.value = userData.bio || '';
  
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Failed to load profile data');
    }
  
    // Form submission to save updates
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const updatedData = {
        startupName: form.startupName.value,
        startupIndustry: form.startupIndustry.value,
        companyDescription: form.companyDescription.value,
        establishYear: form.establishYear.value,
        fundingStage: form.fundingStage.value,
        amountToRaiseFund: form.amountToRaiseFund.value,
        tam: form.tam.value,
        sam: form.sam.value,
        companyReserves: form.companyReserves.value,
        website: form.website.value,
        linkedIn: form.linkedIn.value,
        twitter: form.twitter.value
      };
  
      try {
        const response = await fetch(`/profile/${userType}/${sanitizedUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
  
        const result = await response.json();
        alert(result.message || 'Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error saving profile data');
      }
    });
  });