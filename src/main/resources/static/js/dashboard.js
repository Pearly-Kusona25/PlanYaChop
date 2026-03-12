document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("/dashboard")) {
        return;
    }

    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const response = await fetch("/api/recipes/dashboard", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load dashboard data");
        }

        const data = await response.json();
        renderStats(data);
        renderRecentRecipes(data.recentRecipes || []);
        renderPlanner(data.weeklyPlanner || []);
        renderShopping(data.shoppingList || []);
        renderFavorites(data.favorites || []);
    } catch (error) {
        console.error("Dashboard load error:", error);
    }
}

function renderStats(data) {
    const totalRecipes = document.getElementById("totalRecipesValue");
    const totalUsers = document.getElementById("totalUsersValue");
    const recentCount = document.getElementById("recentRecipesCountValue");

    if (totalRecipes) {
        totalRecipes.textContent = String(data.totalRecipes ?? 0);
    }
    if (totalUsers) {
        totalUsers.textContent = String(data.totalUsers ?? 0);
    }
    if (recentCount) {
        recentCount.textContent = String((data.recentRecipes || []).length);
    }
}

function renderRecentRecipes(recipes) {
    const container = document.getElementById("recentRecipesList");
    const emptyState = document.getElementById("recentRecipesEmpty");
    const serverList = document.getElementById("recentRecipesServerList");
    if (!container || !emptyState) {
        return;
    }
    if (serverList) {
        serverList.classList.add("d-none");
    }

    if (!recipes.length) {
        container.classList.add("d-none");
        emptyState.classList.remove("d-none");
        return;
    }

    const rows = recipes.map((recipe) => {
        const title = escapeHtml(recipe.title || "Untitled Recipe");
        const cuisine = escapeHtml(recipe.cuisine || "General");
        const difficulty = escapeHtml((recipe.difficulty || "N/A").toUpperCase());

        return `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${title}</h6>
                        <small class="text-muted">${cuisine}</small>
                    </div>
                    <span class="badge text-bg-light border">${difficulty}</span>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = rows;
    container.classList.remove("d-none");
    emptyState.classList.add("d-none");
}

function renderPlanner(entries) {
    const list = document.querySelector("#planner ul.list-group");
    if (!list || !entries.length) return;
    list.innerHTML = entries.map(e =>
        `<li class="list-group-item d-flex justify-content-between"><span>${escapeHtml(e.day)}</span><span>${escapeHtml(e.meal)}</span></li>`
    ).join("");
}

function renderShopping(items) {
    const list = document.querySelector("#shopping ul.list-group");
    if (!list || !items.length) return;
    list.innerHTML = items.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${escapeHtml(item.name)} (${escapeHtml(item.quantity)})</span>
            <input class="form-check-input" type="checkbox" ${item.purchased ? "checked" : ""}>
        </li>
    `).join("");
}

function renderFavorites(favs) {
    const wrap = document.querySelector("#favorites .d-flex.flex-wrap");
    if (!wrap || !favs.length) return;
    wrap.innerHTML = favs.map(f => `<span class="badge text-bg-light border">${escapeHtml(f)}</span>`).join("");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
