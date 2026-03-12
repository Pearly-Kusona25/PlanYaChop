document.addEventListener("DOMContentLoaded", () => {
    const chartCanvas = document.getElementById("userActivityChart");
    if (!chartCanvas || typeof Chart === "undefined") {
        return;
    }

    new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
                {
                    label: "Active Users",
                    data: [120, 150, 132, 174, 162, 188, 205],
                    borderColor: "#1f6a43",
                    backgroundColor: "rgba(31, 106, 67, 0.15)",
                    fill: true,
                    tension: 0.35
                },
                {
                    label: "Recipe Actions",
                    data: [90, 95, 110, 128, 121, 140, 154],
                    borderColor: "#f28c28",
                    backgroundColor: "rgba(242, 140, 40, 0.12)",
                    fill: true,
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(47, 71, 56, 0.12)"
                    }
                },
                x: {
                    grid: {
                        color: "rgba(47, 71, 56, 0.08)"
                    }
                }
            }
        }
    });
});
