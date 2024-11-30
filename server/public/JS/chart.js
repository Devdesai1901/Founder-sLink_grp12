// /public/JS/charts.js

document.addEventListener("DOMContentLoaded", function () {
  // Access the data passed from Handlebars
  const revenueData = window.founderData.revenueHistory;
  const spendingData = window.founderData.companySpent;
  const equityData = window.founderData.equityDilutionHistory;

  if (revenueData) {
    const ctxRevenue = document.getElementById("revenueChart").getContext("2d");
    new Chart(ctxRevenue, {
      type: "bar",
      data: {
        labels: revenueData.map((item) => item.year),
        datasets: [
          {
            label: "Revenue ($)",
            data: revenueData.map((item) => item.revenue),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
        ],
      },
      options: { responsive: true },
    });
  }

  if (spendingData) {
    const ctxSpending = document
      .getElementById("spendingChart")
      .getContext("2d");
    new Chart(ctxSpending, {
      type: "pie",
      data: {
        labels: Object.keys(spendingData),
        datasets: [
          {
            data: Object.values(spendingData),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          },
        ],
      },
    });
  }

  if (equityData) {
    const ctxEquity = document.getElementById("equityChart").getContext("2d");
    new Chart(ctxEquity, {
      type: "pie",
      data: {
        labels: equityData.map((item) => item.year),
        datasets: [
          {
            label: "Equity Dilution (%)",
            data: equityData.map((item) => item.dilutionPercentage),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            fill: true,
          },
        ],
      },
    });
  }
});
