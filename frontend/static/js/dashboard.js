let dashboardCache = null;
let dashboardRecipeModal = null;
let dashboardChatbot = null;

document.addEventListener("DOMContentLoaded", async () => {
    if (!window.location.pathname.includes("/dashboard")) {
        return;
    }

    await initDashboard();
});

async function initDashboard() {
    dashboardRecipeModal = window.bootstrap
        ? new window.bootstrap.Modal(document.getElementById("dashboardRecipeModal"))
        : null;

    bindRequestButtons();
    bindSavedRecipeClicks();
    initDashboardChatbot();
    await loadDashboardBaseData();
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
            const days = readRequestedDays();
            mealPlanButton.disabled = true;
            mealPlanButton.textContent = "Loading Meal Plan...";
            const planner = await requestMealPlan(days);
            renderPlanner(planner, days);
            mealPlanButton.textContent = "Meal Plan Requested";
            mealPlanButton.disabled = false;
        });
    }

    if (shoppingButton) {
        shoppingButton.addEventListener("click", async () => {
            shoppingButton.disabled = true;
            shoppingButton.textContent = "Loading Shopping List...";
            const shopping = await requestShoppingList();
            renderShopping(shopping);
            shoppingButton.textContent = "Shopping List Requested";
            shoppingButton.disabled = false;
        });
    }
}

function bindSavedRecipeClicks() {
    ["savedRecipesClientGrid", "savedRecipesServerGrid"].forEach((id) => {
        const grid = document.getElementById(id);
        if (!grid) {
            return;
        }
        grid.addEventListener("click", async (event) => {
            const card = event.target.closest("[data-action='open-recipe']");
            if (!card) {
                return;
            }
            const recipeId = Number(card.getAttribute("data-id"));
            if (!Number.isFinite(recipeId)) {
                return;
            }
            await openDashboardRecipe(recipeId);
        });
    });
}

function initDashboardChatbot() {
    if (!window.PlanYaChopChatbot || typeof window.PlanYaChopChatbot.createChatbot !== "function") {
        return;
    }

    dashboardChatbot = window.PlanYaChopChatbot.createChatbot({
        onMealPlanRequest: async (days) => {
            const planner = await requestMealPlan(days);
            renderPlanner(planner, days);
            return planner;
        },
        onShoppingListRequest: async () => {
            const shopping = await requestShoppingList();
            renderShopping(shopping);
            return shopping;
        }
    });
}

async function openDashboardRecipe(id) {
    try {
        const response = await fetch(`/api/recipes/${id}`, {
            method: "GET",
            headers: buildHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to load recipe details");
        }
        const recipe = await response.json();
        populateDashboardRecipeModal(recipe);
        if (dashboardRecipeModal) {
            dashboardRecipeModal.show();
        }
        if (dashboardChatbot && typeof dashboardChatbot.activateForRecipe === "function") {
            dashboardChatbot.activateForRecipe(recipe);
        }
    } catch (error) {
        console.error("Open recipe error:", error);
    }
}

function populateDashboardRecipeModal(recipe) {
    const title = document.getElementById("dashboardRecipeModalTitle");
    const summary = document.getElementById("dashboardRecipeSummary");
    const meta = document.getElementById("dashboardRecipeMeta");
    const ingredients = document.getElementById("dashboardRecipeIngredients");
    const steps = document.getElementById("dashboardRecipeSteps");

    if (title) title.textContent = recipe.title || "Meal details";
    if (summary) summary.textContent = recipe.description || "Recipe details";

    if (meta) {
        meta.innerHTML = [
            `Prep: ${recipe.prepTime || 0} mins`,
            `Cook: ${recipe.cookTime || 0} mins`,
            `Serves: ${recipe.servings || 0}`,
            `Cuisine: ${recipe.cuisine || "Cameroonian"}`
        ].map((entry) => `<span class="recipe-meta-tag">${escapeHtml(entry)}</span>`).join("");
    }

    if (ingredients) {
        const items = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        ingredients.innerHTML = items.length
            ? items.map((item) => `<li>${escapeHtml(formatIngredient(item))}</li>`).join("")
            : "<li>No ingredients listed.</li>";
    }

    if (steps) {
        const items = Array.isArray(recipe.instructions) ? recipe.instructions : [];
        steps.innerHTML = items.length
            ? items.map((item) => `<li>${escapeHtml(item.description || "")}</li>`).join("")
            : "<li>No instructions listed.</li>";
    }
}

async function requestMealPlan(days = 7) {
    try {
        const response = await fetch("/api/recipes/meal-plan/request", {
            method: "POST",
            headers: buildHeaders()
        });
        if (!response.ok) {
            throw new Error("Meal plan request failed");
        }
        const payload = await response.json();
        const entries = Array.isArray(payload) ? payload : [];
        return limitPlanByDays(entries, days);
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

function limitPlanByDays(entries, days) {
    const safeDays = Math.min(7, Math.max(1, Number(days) || 7));
    const allowedDays = [];
    const output = [];

    entries.forEach((entry) => {
        const day = entry?.day || "";
        if (!day) {
            return;
        }
        if (!allowedDays.includes(day) && allowedDays.length < safeDays) {
            allowedDays.push(day);
        }
        if (allowedDays.includes(day)) {
            output.push(entry);
        }
    });

    return output;
}

function readRequestedDays() {
    const daysInput = document.getElementById("mealPlanDays");
    const days = Number(daysInput?.value || 7);
    return Math.min(7, Math.max(1, Number.isFinite(days) ? days : 7));
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
        const recipeId = Number(recipe.id || 0);

        return `
            <div class="col-12 col-sm-6 col-lg-4">
                <div class="card recipe-card h-100" data-action="open-recipe" data-id="${recipeId}">
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

function renderPlanner(entries, days = 7) {
    const section = document.getElementById("plannerSection");
    const tableBody = document.getElementById("plannerTableBody");
    if (!section || !tableBody) {
        return;
    }

    if (!entries.length) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-muted">No meal plan available yet.</td></tr>`;
    } else {
        tableBody.innerHTML = entries.map((entry) => {
            const meal = String(entry.meal || "");
            const splitIndex = meal.indexOf(":");
            const slot = splitIndex > -1 ? meal.slice(0, splitIndex).trim() : "Meal";
            const recipe = splitIndex > -1 ? meal.slice(splitIndex + 1).trim() : meal;

            return `
                <tr>
                    <td>${escapeHtml(entry.day || "")}</td>
                    <td>${escapeHtml(slot)}</td>
                    <td>${escapeHtml(recipe)}</td>
                </tr>
            `;
        }).join("");
    }

    section.classList.remove("d-none");
    section.setAttribute("data-days", String(days));
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

function formatIngredient(item) {
    if (!item) return "";
    const quantity = item.quantity ? `${item.quantity} ` : "";
    const unit = item.unit ? `${item.unit} ` : "";
    return `${quantity}${unit}${item.name || ""}`.trim();
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
