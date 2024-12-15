document.getElementById('saveBtn').addEventListener('click', async () => {
    const formData = {
        investorType: document.getElementById('investorType').value,
        industries: document.getElementById('industries').value.split(','),
        fundingStages: document.getElementById('fundingStages').value.split(','),
        geographicPreferences: document.getElementById('geographicPreferences').value.split(','),
        minimumInvestmentAmount: parseFloat(document.getElementById('minimumInvestmentAmount').value),
        preferredStartupSize: document.getElementById('preferredStartupSize').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        preferredContactMethod: document.getElementById('preferredContactMethod').value,
        website: document.getElementById('website').value,
        linkedin: document.getElementById('linkedin').value,
        twitter: document.getElementById('twitter').value,
        personalBlog: document.getElementById('personalBlog').value,
        description: document.getElementById('description').value
    };

    // Basic validation checks
    if (isNaN(formData.minimumInvestmentAmount) || formData.minimumInvestmentAmount <= 0) {
        alert('Please enter a valid minimum investment amount');
        return;
    }

    if (!formData.email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        const response = await fetch('/save-investor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Investor data saved successfully');
        } else {
            alert('Failed to save investor data');
        }
    } catch (error) {
        console.error('Save Error:', error);
        alert('An error occurred while saving investor data');
    }
});