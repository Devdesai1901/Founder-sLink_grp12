const form = document.getElementById('investorForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/investor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const { message } = await response.json();
    alert(message);
  } catch (error) {
    alert('Error submitting form');
    console.error('Submission error:', error);
  }
});