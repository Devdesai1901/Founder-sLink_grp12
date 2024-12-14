document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.getElementById('search-bar');
  const categoryFilter = document.getElementById('category-filter');
  const investorList = document.getElementById('investor-list');
  const filterSubmit = document.getElementById('filter-submit'); // Reference to the Submit button

  let allInvestors = [];

  // Fetch investors dynamically
  async function fetchInvestors() {
    try {
      const response = await fetch('http://localhost:3000/investor/getList');
      const data = await response.json();
      console.log(data); // Log the fetched data
      allInvestors = data; // Save data for filtering
      displayInvestors(data); // Display all investors initially
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  }

  // Display investors in the list
  function displayInvestors(investors) {
    investorList.innerHTML = '';
    investors.forEach(investor => {
      const li = document.createElement('li');
      li.textContent = `${investor.firstName} ${investor.lastName} (${investor.userType})`;
      investorList.appendChild(li);
    });
  }

  // Filter investors based on search and category
  function filterInvestors() {
    const filterText = searchBar.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value.toLowerCase();
    const filteredInvestors = allInvestors.filter(investor => {
      const fullName = `${investor.firstName} ${investor.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(filterText);
      const matchesCategory = selectedCategory === 'all' || investor.userType.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    displayInvestors(filteredInvestors);
  }

  // Add event listener for Submit button
  filterSubmit.addEventListener('click', filterInvestors);

  // Fetch initial list of investors
  fetchInvestors();
});
