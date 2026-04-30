let dashboardCache = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("/dashboard")) {
        return;
    }

    initDashboard();
});

async function initDashboard() {
    await loadDashboardBaseData();
    bindRequestButtons();
}

async function loadDashboardBaseData() {
    try {
        const response = await fetch("/api/recipes/dashboard", {
            method: "GET",
            headers: buildHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to load dashboard data");
        }

        dashboardCache = await response.json();
        renderSavedRecipes(dashboardCache.recentRecipes || []);
    } catch (error) {
        console.error("Dashboard load error:", error);
    }
}

function bindRequestButtons() {
    const mealPlanButton = document.getElementById("requestMealPlanBtn");
    const shoppingButton = document.getElementById("requestShoppingListBtn");

    if (mealPlanButton) {
        mealPlanButton.addEventListener("click", async () => {
            mealPlanButton.disabled = true;
            mealPlanButton.textContent = "Loading Meal Plan...";
            const planner = await requestMealPlan();
            renderPlanner(planner);
            mealPlanButton.textContent = "Meal Plan Requested";
        });
    }

    if (shoppingButton) {
        shoppingButton.addEventListener("click", async () => {
            shoppingButton.disabled = true;
            shoppingButton.textContent = "Loading Shopping List...";
            const shopping = await requestShoppingList();
            renderShopping(shopping);
            shoppingButton.textContent = "Shopping List Requested";
        });
    }
}

async function ensureDashboardCache() {
    if (dashboardCache) {
        return;
    }
    await loadDashboardBaseData();
}

async function requestMealPlan() {
    try {
        const response = await fetch("/api/recipes/meal-plan/request", {
            method: "POST",
            headers: buildHeaders()
        });
        if (!response.ok) {
            throw new Error("Meal plan request failed");
        }
        const payload = await response.json();
        return Array.isArray(payload) ? payload : [];
    } catch (error) {
        console.error("Meal plan request error:", error);
        return [];
    }
}

async function requestShoppingList() {
    try {
        const response = await fetch("/api/recipes/shopping-list/request", {
            method: "POST",
            headers: buildHeaders()
        });
        if (!response.ok) {
            throw new Error("Shopping list request failed");
        }
        const payload = await response.json();
        return Array.isArray(payload) ? payload : [];
    } catch (error) {
        console.error("Shopping list request error:", error);
        return [];
    }
}

function renderSavedRecipes(recipes) {
    const clientGrid = document.getElementById("savedRecipesClientGrid");
    const serverGrid = document.getElementById("savedRecipesServerGrid");
    const emptyState = document.getElementById("savedRecipesEmpty");
    const countBadge = document.getElementById("savedRecipesCountValue");
    if (!clientGrid || !serverGrid || !emptyState || !countBadge) {
        return;
    }

    countBadge.textContent = String(recipes.length);
    if (!recipes.length) {
        clientGrid.classList.add("d-none");
        serverGrid.classList.add("d-none");
        emptyState.classList.remove("d-none");
        return;
    }

    const cards = recipes.map((recipe) => {
        const title = escapeHtml(recipe.title || "Untitled Recipe");
        const cuisine = escapeHtml(recipe.cuisine || "General");
        const description = escapeHtml(recipe.description || "Saved recipe from database");
        const prep = Number(recipe.prepTime || 0);
        const cook = Number(recipe.cookTime || 0);
        const servings = Number(recipe.servings || 0);

        return `
            <div class="col-12 col-sm-6 col-lg-4">
                <div class="card recipe-card h-100">
                    <img src="${escapeHtml(recipe.imageUrl || "/images/recipe-placeholder.png")}" class="card-img-top recipe-image" alt="Recipe image">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${title}</h5>
                            <span class="badge rounded-pill bg-warning text-dark">${cuisine}</span>
                        </div>
                        <p class="card-text text-muted small mb-2">${description}</p>
                        <small class="text-muted mt-auto">Prep ${prep}m | Cook ${cook}m | Serves ${servings}</small>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    clientGrid.innerHTML = cards;
    clientGrid.classList.remove("d-none");
    serverGrid.classList.add("d-none");
    emptyState.classList.add("d-none");
}

function renderPlanner(entries) {
    const section = document.getElementById("plannerSection");
    const list = document.getElementById("plannerList");
    if (!section || !list) {
        return;
    }

    if (!entries.length) {
        list.innerHTML = '<li class="list-group-item text-muted">No meal plan available yet.</li>';
    } else {
        list.innerHTML = entries.map((entry) =>
            `<li class="list-group-item d-flex justify-content-between"><span>${escapeHtml(entry.day)}</span><span>${escapeHtml(entry.meal)}</span></li>`
        ).join("");
    }

    section.classList.remove("d-none");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderShopping(items) {
    const section = document.getElementById("shoppingSection");
    const list = document.getElementById("shoppingList");
    if (!section || !list) {
        return;
    }

    if (!items.length) {
        list.innerHTML = '<li class="list-group-item text-muted">No shopping list available yet.</li>';
    } else {
        list.innerHTML = items.map((item) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${escapeHtml(item.name)} (${escapeHtml(item.quantity)})</span>
                <input class="form-check-input" type="checkbox" ${item.purchased ? "checked" : ""}>
            </li>
        `).join("");
    }

    section.classList.remove("d-none");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildHeaders() {
    const headers = { "Content-Type": "application/json" };
    const authHeader = window.authService && typeof window.authService.getAuthHeader === "function"
        ? window.authService.getAuthHeader()
        : null;
    if (authHeader) {
        headers.Authorization = authHeader;
    }
    return headers;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
