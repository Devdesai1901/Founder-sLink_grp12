document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("founderForm");

  // Function to get values from dynamically added fields
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Form data validation
    const startupName = document.getElementById("startupName").value.trim();
    const startupIndustry = document
      .getElementById("startupIndustry")
      .value.trim();
    const companyDescription = document
      .getElementById("companyDescription")
      .value.trim();
    const establishYear = document.getElementById("establishYear").value.trim();
    const fundingStage = document.getElementById("fundingStage").value;
    const amountToRaiseFund = document
      .getElementById("amountToRaiseFund")
      .value.trim();
    const tam = document.getElementById("tam").value.trim();
    const sam = document.getElementById("sam").value.trim();
    const companyReserves = document
      .getElementById("companyReserves")
      .value.trim();
    const website = document.getElementById("website").value.trim();
    const linkedIn = document.getElementById("linkedIn").value.trim();
    const twitter = document.getElementById("twitter").value.trim();
    const salaries = document.getElementById("salaries").value.trim();
    const marketingCost = document.getElementById("marketingCost").value.trim();
    const productRnD = document.getElementById("productRnD").value.trim();
    const miscellaneous = document.getElementById("miscellaneous").value.trim();
    const valuation = document.getElementById("valuation").value.trim();
    const profitMargin = document.getElementById("profitMargin").value.trim();
    const totalFundingReceived = document
      .getElementById("totalFundingReceived")
      .value.trim();
    const teamSize = document.getElementById("teamSize").value.trim();
    const monthlyActiveUsers = document
      .getElementById("monthlyActiveUsers")
      .value.trim();
    const customerRetentionRate = document
      .getElementById("customerRetentionRate")
      .value.trim();
    const annualRecurringRevenue = document
      .getElementById("annualRecurringRevenue")
      .value.trim();

    // Basic validation
    if (
      !startupName ||
      !startupIndustry ||
      !establishYear ||
      !fundingStage ||
      !amountToRaiseFund
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    if (companyDescription.length > 2000) {
      alert("Company description cannot exceed 2000 characters.");
      return;
    }

    if (
      isNaN(establishYear) ||
      establishYear < 1800 ||
      establishYear > new Date().getFullYear()
    ) {
      alert("Please enter a valid year for establishment.");
      return;
    }

    if (isNaN(amountToRaiseFund) || amountToRaiseFund <= 0) {
      alert("Please enter a valid amount to raise funds.");
      return;
    }

    // Get dynamic field values
    const coFounders = getDynamicFieldValues("coFoundersContainer", [
      "coFounders[0].firstName",
      "coFounders[0].lastName",
      "coFounders[0].email",
    ]);
    const revenueHistory = getDynamicFieldValues("revenueHistoryContainer", [
      "financialDetails.revenueHistory[0].year",
      "financialDetails.revenueHistory[0].revenue",
    ]);
    const equityDilutionHistory = getDynamicFieldValues(
      "equityDilutionHistoryContainer",
      [
        "financialDetails.equityDilutionHistory[0].year",
        "financialDetails.equityDilutionHistory[0].dilutionPercentage",
        "financialDetails.equityDilutionHistory[0].nameOfInvestor",
      ]
    );
    const majorCompetitors = getDynamicFieldValues(
      "majorCompetitorsContainer",
      ["majorCompetitors[0]"]
    );
    const milestones = getDynamicFieldValues("milestonesContainer", [
      "milestones[0].milestoneName",
      "milestones[0].dateAchieved",
      "milestones[0].description",
    ]);

    // Flatten the nested objects
    const flattenObject = (obj) => {
      const result = {};
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          const flatObject = flattenObject(obj[key]);
          for (const subKey in flatObject) {
            result[`${key}.${subKey}`] = flatObject[subKey];
          }
        } else {
          result[key] = obj[key];
        }
      }
      return result;
    };

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
      financialDetails: {
        companySpent: {
          salaries: salaries || null,
          marketingCost: marketingCost || null,
          productRnD: productRnD || null,
          miscellaneous: miscellaneous || null,
        },
        revenueHistory: revenueHistory.map(flattenObject),
        equityDilutionHistory: equityDilutionHistory.map(flattenObject),
      },
      keyMetrics: {
        valuation: valuation || null,
        profitMargin: profitMargin || null,
        totalFundingReceived: totalFundingReceived || null,
        teamSize: teamSize || null,
      },
      traction: {
        monthlyActiveUsers: monthlyActiveUsers || null,
        customerRetentionRate: customerRetentionRate || null,
        annualRecurringRevenue: annualRecurringRevenue || null,
      },
      coFounders: coFounders.map((cf) => ({
        firstName: cf.coFounders.firstName,
        lastName: cf.coFounders.lastName,
        email: cf.coFounders.email,
      })),
      majorCompetitors: majorCompetitors.map((mc) => mc.majorCompetitors[0]),
      milestones: milestones.map((ms) => ({
        milestoneName: ms.milestones.milestoneName,
        dateAchieved: ms.milestones.dateAchieved,
        description: ms.milestones.description,
      })),
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

  // Function to add dynamic fields
  const addDynamicField = (containerId, fieldNames) => {
    const container = document.getElementById(containerId);
    const fieldGroup = document.createElement("div");
    fieldGroup.classList.add("form-group");
    fieldNames.forEach((fieldName) => {
      const label = document.createElement("label");
      label.setAttribute("for", fieldName);
      label.textContent =
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ":";
      const input = document.createElement("input");
      input.setAttribute("type", "text");
      input.classList.add("form-control");
      input.setAttribute("name", fieldName);
      fieldGroup.appendChild(label);
      fieldGroup.appendChild(input);
    });
    container.appendChild(fieldGroup);
  };

  // Add event listeners for add buttons
  document.getElementById("addCoFounder").addEventListener("click", () => {
    addDynamicField("coFoundersContainer", [
      `coFounders[${coFounderIndex}].firstName`,
      `coFounders[${coFounderIndex}].lastName`,
      `coFounders[${coFounderIndex}].email`,
    ]);
    coFounderIndex++;
  });
  document.getElementById("addRevenueHistory").addEventListener("click", () => {
    addDynamicField("revenueHistoryContainer", [
      `financialDetails.revenueHistory[${revenueHistoryIndex}].year`,
      `financialDetails.revenueHistory[${revenueHistoryIndex}].revenue`,
    ]);
    revenueHistoryIndex++;
  });
  document
    .getElementById("addEquityDilutionHistory")
    .addEventListener("click", () => {
      addDynamicField("equityDilutionHistoryContainer", [
        `financialDetails.equityDilutionHistory[${equityDilutionHistoryIndex}].year`,
        `financialDetails.equityDilutionHistory[${equityDilutionHistoryIndex}].dilutionPercentage`,
        `financialDetails.equityDilutionHistory[${equityDilutionHistoryIndex}].nameOfInvestor`,
      ]);
      equityDilutionHistoryIndex++;
    });
  document
    .getElementById("addMajorCompetitor")
    .addEventListener("click", () => {
      addDynamicField("majorCompetitorsContainer", [
        `majorCompetitors[${majorCompetitorsIndex}]`,
      ]);
      majorCompetitorsIndex++;
    });
  document.getElementById("addMilestone").addEventListener("click", () => {
    addDynamicField("milestonesContainer", [
      `milestones[${milestonesIndex}].milestoneName`,
      `milestones[${milestonesIndex}].dateAchieved`,
      `milestones[${milestonesIndex}].description`,
    ]);
    milestonesIndex++;
  });
});
