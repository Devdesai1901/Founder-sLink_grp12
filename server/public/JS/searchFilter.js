document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("search-bar");
    const categoryFilter = document.getElementById("category-filter");
    const submitButton = document.getElementById("filter-submit");

    // Create a form element and set up its structure
    const filterForm = document.createElement("form");
    filterForm.id = "filter-form";

    // Select the container and move elements inside the form
    const filterContainer = document.querySelector(".filter-container");
    filterContainer.innerHTML = ""; // Clear the container
    filterContainer.appendChild(filterForm); // Append the form

    // Add the existing elements into the form
    filterForm.appendChild(searchBar);
    filterForm.appendChild(categoryFilter);
    filterForm.appendChild(submitButton);

    // Recreate and append the investor/founder list
    const investorList = document.createElement("ul");
    investorList.id = "investor-list";
    filterContainer.appendChild(investorList);

    let combinedData = []; // Combined array to store both investors and founders

    // Function to fetch data from both endpoints and combine them
    async function fetchAllData() {
        try {
            const [investorResponse, founderResponse] = await Promise.all([
                fetch("/investor/getList"),
                fetch("/founder/getList"),
            ]);

            if (!investorResponse.ok || !founderResponse.ok) {
                throw new Error("Failed to fetch data from one or more endpoints.");
            }

            const investors = await investorResponse.json();
            const founders = await founderResponse.json();

            // Map data into a unified format
            const mappedInvestors = investors.map((investor) => ({
                _id: investor._id,
                userType: "investor",
                firstName: investor.firstName,
                lastName: investor.lastName,
            }));

            const mappedFounders = founders.map((founder) => ({
                _id: founder._id,
                userType: "founder",
                firstName: founder.firstName,
                lastName: founder.lastName,
            }));

            // Combine both arrays
            combinedData = [...mappedInvestors, ...mappedFounders];
            console.log("Combined Data:", combinedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            investorList.innerHTML = `<li>Error loading data: ${error.message}</li>`;
        }
    }

    // Function to display the filtered results
    function displayResults(filteredData) {
        investorList.innerHTML = ""; // Clear the existing list

        if (filteredData.length === 0) {
            investorList.innerHTML = "<li>No results found</li>";
        } else {
            filteredData.forEach((user) => {
                const listItem = document.createElement("li");
            
                // Create the anchor element
                const link = document.createElement("a");
                link.href = `/${user.userType}/${user._id}`; // Ensure it starts from the root
                link.textContent = `${user.firstName} ${user.lastName} (${user.userType})`;
                link.target = "_blank"; // Opens link in a new tab (optional)
            
                // Append the anchor to the list item
                listItem.appendChild(link);
            
                // Append the list item to the main list
                investorList.appendChild(listItem);
            });
            
        }
    }

    // Filter and display combined data based on user input
    function filterAndDisplayResults() {
        const searchQuery = searchBar.value.trim().toLowerCase();
        const selectedSector = categoryFilter.value.toLowerCase();

        // Only proceed if there's input or a sector selection
        if (searchQuery.length === 0 && selectedSector === "all") {
            investorList.innerHTML =
                "<li>Please enter a search query or select a sector</li>";
            return;
        }

        const filteredData = combinedData.filter((user) => {
            const matchesName =
                user.firstName.toLowerCase().includes(searchQuery) ||
                user.lastName.toLowerCase().includes(searchQuery);
            const matchesSector =
                selectedSector === "all" ||
                (user.userType && user.userType.toLowerCase() === selectedSector);

            return matchesName && matchesSector;
        });

        console.log("Filtered Results:", filteredData);
        displayResults(filteredData);
    }

    // Add event listener to handle form submission
    filterForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission
        filterAndDisplayResults(); // Call the filtering function
    });

    // Fetch all data on page load, but do NOT display it initially
    fetchAllData();
});
