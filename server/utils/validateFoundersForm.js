function saveData() {
    const form = document.getElementById('founderForm');
    const formData = new FormData(form);

    const startupName = formData.get('startupName');
    const startupIndustry = formData.get('startupIndustry');
    const establishYear = formData.get('establishYear');
    const fundingGoal = formData.get('amountToRaiseFund');

    if (isNaN(establishYear) || establishYear < 1900 || establishYear > 2024) {
        alert('Please enter a valid establishment year.');
        return;
    }

    if (isNaN(fundingGoal) || fundingGoal <= 0) {
        alert('Funding goal must be a positive number.');
        return;
    }

    if (!startupName.trim() || !startupIndustry.trim()) {
        alert('Startup name and industry cannot be empty.');
        return;
    }

    submitData(formData);
}

async function submitData(formData) {
    try {
        const response = await fetch('/api/update-founder', {
            method: 'POST',
            body: formData,
        });

        const result = await response.text();
        if (response.ok) {
            alert('Data saved successfully.');
        } else {
            alert('Error saving data.');
        }
        console.log(result);
    } catch (error) {
        console.error('API Error:', error);
    }
}