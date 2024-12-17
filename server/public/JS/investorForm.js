document.addEventListener("DOMContentLoaded", () => {
  let performanceMetricsIndex = 1;

  function addPerformanceMetrics() {
    const container = document.getElementById("performanceMetricsContainer");
    const performanceMetricsHTML = `
        <div class="form-group">
          <label for="totalInvested${performanceMetricsIndex}">Total Invested (USD):</label>
          <input type="number" class="form-control" id="totalInvested${performanceMetricsIndex}" name="performanceMetrics[${performanceMetricsIndex}].totalInvested" required>
        </div>
        <div class="form-group">
          <label for="returnsGenerated${performanceMetricsIndex}">Returns Generated (USD):</label>
          <input type="number" class="form-control" id="returnsGenerated${performanceMetricsIndex}" name="performanceMetrics[${performanceMetricsIndex}].returnsGenerated" required>
        </div>
        <div class="form-group">
          <label for="activeDeals${performanceMetricsIndex}">Active Deals:</label>
          <input type="number" class="form-control" id="activeDeals${performanceMetricsIndex}" name="performanceMetrics[${performanceMetricsIndex}].activeDeals" required>
        </div>
        <div class="form-group">
          <label for="portfolioValue${performanceMetricsIndex}">Portfolio Value (USD):</label>
          <input type="number" class="form-control" id="portfolioValue${performanceMetricsIndex}" name="performanceMetrics[${performanceMetricsIndex}].portfolioValue" required>
        </div>
      `;
    container.insertAdjacentHTML("beforeend", performanceMetricsHTML);
    performanceMetricsIndex++;
  }

  // Add the first set of performance metrics fields by default
  addPerformanceMetrics();

  const getDynamicFieldValues = (containerId, fieldNames) => {
    const container = document.getElementById(containerId);
    const values = [];
    let index = 0;
    while (true) {
      const value = {};
      let hasValues = false;
      fieldNames.forEach((fieldName) => {
        const input = container.querySelector(
          `[name="${fieldName.replace("0", index)}"]`
        );
        if (input) {
          const keys = fieldName.replace(/\[\d+\]/, "").split(".");
          const lastKey = keys.pop();
          let nestedValue = value;
          keys.forEach((key) => {
            if (!nestedValue[key]) {
              nestedValue[key] = {};
            }
            nestedValue = nestedValue[key];
          });
          nestedValue[lastKey] = input.value.trim();
          hasValues = true;
        }
      });
      if (hasValues) {
        values.push(value);
      } else {
        break;
      }
      index++;
    }
    return values;
  };

  document
    .getElementById("investorForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent the default form submission

      // Form data validation
      const investorType = document.getElementById("investorType").value;
      const industries = Array.from(
        document.getElementById("industries").selectedOptions
      ).map((option) => option.value);
      const fundingStages = document
        .getElementById("fundingStages")
        .value.trim();
      const geographicPreferences = document
        .getElementById("geographicPreferences")
        .value.trim();
      const minimumInvestmentAmount = document
        .getElementById("minimumInvestmentAmount")
        .value.trim();
      const preferredStartupSize = document.getElementById(
        "preferredStartupSize"
      ).value;
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const preferredContactMethod = document.getElementById(
        "preferredContactMethod"
      ).value;
      const website = document.getElementById("website").value.trim();
      const linkedIn = document.getElementById("linkedIn").value.trim();
      const twitter = document.getElementById("twitter").value.trim();
      const personalBlog = document.getElementById("personalBlog").value.trim();
      const description = document.getElementById("description").value.trim();

      // Basic validation
      if (
        !investorType ||
        !industries.length ||
        !minimumInvestmentAmount ||
        !phone ||
        !email
      ) {
        alert("Please fill out all required fields.");
        return;
      }

      if (isNaN(minimumInvestmentAmount) || minimumInvestmentAmount <= 0) {
        alert("Please enter a valid minimum investment amount.");
        return;
      }

      // Get dynamic field values
      const performanceMetrics = getDynamicFieldValues(
        "performanceMetricsContainer",
        [
          "performanceMetrics[0].totalInvested",
          "performanceMetrics[0].returnsGenerated",
          "performanceMetrics[0].activeDeals",
          "performanceMetrics[0].portfolioValue",
        ]
      );

      // Create the payload
      const payload = {
        investorType,
        investmentPreferences: {
          industries,
          fundingStages: fundingStages
            ? fundingStages.split(",").map((stage) => stage.trim())
            : [],
          geographicPreferences: geographicPreferences
            ? geographicPreferences.split(",").map((pref) => pref.trim())
            : [],
          minimumInvestmentAmount: parseFloat(minimumInvestmentAmount),
          preferredStartupSize,
        },
        contactInformation: {
          phone,
          email,
          preferredContactMethod,
        },
        socialLinks: {
          website: website || null,
          linkedIn: linkedIn || null,
          twitter: twitter || null,
          personalBlog: personalBlog || null,
        },
        performanceMetrics: performanceMetrics.map((pm) => ({
          totalInvested: parseFloat(pm.totalInvested),
          returnsGenerated: parseFloat(pm.returnsGenerated),
          activeDeals: parseInt(pm.activeDeals, 10),
          portfolioValue: parseFloat(pm.portfolioValue),
        })),
        description,
      };

      try {
        // Submit the form data to the server
        const response = await fetch("/investor/investorProfileForm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert("Form submitted successfully!");
          document.getElementById("investorForm").reset(); // Clear the form
        } else {
          const error = await response.json();
          alert(
            `Error: ${
              error.message || "An error occurred while submitting the form."
            }`
          );
        }
      } catch (error) {
        console.error("Submission failed:", error);
        alert("Failed to submit the form. Please try again later.");
      }
    });
});
