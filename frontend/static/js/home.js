let homeMeals = [];
let homeFavorites = new Set();
let homeShowFavoritesOnly = false;
let homeActiveRecipeId = null;
let homeRecipeModal = null;

document.addEventListener("DOMContentLoaded", async () => {
    if (!window.location.pathname.includes("/home")) {
        return;
    }

    homeRecipeModal = window.bootstrap ? new window.bootstrap.Modal(document.getElementById("homeRecipeModal")) : null;
    bindHomeInteractions();
    await loadHomeMeals();
    await loadFavorites();
    renderHomeMeals();
    updateFavoriteCount();
});

function bindHomeInteractions() {
    const grid = document.getElementById("homeMealsGrid");
    const searchInput = document.getElementById("homeRecipeSearch");
    const favoritesToggle = document.getElementById("homeShowFavoritesOnly");
    const modalFavoriteButton = document.getElementById("homeModalFavoriteBtn");

    if (searchInput) {
        searchInput.addEventListener("input", () => renderHomeMeals());
    }

    if (favoritesToggle) {
        favoritesToggle.addEventListener("click", () => {
            homeShowFavoritesOnly = !homeShowFavoritesOnly;
            favoritesToggle.textContent = homeShowFavoritesOnly ? "Show All Meals" : "Show Favorites Only";
            renderHomeMeals();
        });
    }

    if (grid) {
        grid.addEventListener("click", async (event) => {
            const favoriteButton = event.target.closest("[data-action='toggle-favorite']");
            if (favoriteButton) {
                const id = Number(favoriteButton.dataset.id);
                await toggleFavorite(id);
                renderHomeMeals();
                return;
            }

            const openButton = event.target.closest("[data-action='open-recipe']");
            if (openButton) {
                const id = Number(openButton.dataset.id);
                await openRecipeModal(id);
            }
        });
    }

    if (modalFavoriteButton) {
        modalFavoriteButton.addEventListener("click", async () => {
            if (!homeActiveRecipeId) {
                return;
            }
            await toggleFavorite(homeActiveRecipeId);
            refreshModalFavoriteButton();
            renderHomeMeals();
        });
    }
}

async function loadHomeMeals() {
    const status = document.getElementById("homeRecipeStatus");
    try {
        const response = await fetch("/api/recipes/home?limit=100", {
            method: "GET",
            headers: buildAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to load meals (${response.status})`);
        }

        homeMeals = await response.json();
        if (status) {
            status.textContent = `Loaded ${homeMeals.length} meals from database.`;
        }
        const count = document.getElementById("homeMealsCount");
        if (count) {
            count.textContent = String(homeMeals.length);
        }
    } catch (error) {
        console.error("Home meals load error:", error);
        if (status) {
            status.textContent = "Could not load meals. Please refresh.";
        }
    }
}

async function loadFavorites() {
    try {
        const response = await fetch("/api/favorites/ids", {
            method: "GET",
            headers: buildAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to load favorites (${response.status})`);
        }
        const ids = await response.json();
        homeFavorites = new Set(Array.isArray(ids) ? ids.map((id) => Number(id)).filter((id) => Number.isFinite(id)) : []);
    } catch (error) {
        console.error("Home favorites load error:", error);
        homeFavorites = new Set();
    }
}

function renderHomeMeals() {
    const grid = document.getElementById("homeMealsGrid");
    const search = (document.getElementById("homeRecipeSearch")?.value || "").trim().toLowerCase();
    if (!grid) {
        return;
    }

    const filtered = homeMeals.filter((meal) => {
        const title = String(meal.title || "").toLowerCase();
        const cuisine = String(meal.cuisine || "").toLowerCase();
        const searchMatch = !search || title.includes(search) || cuisine.includes(search);
        const favoriteMatch = !homeShowFavoritesOnly || homeFavorites.has(meal.id);
        return searchMatch && favoriteMatch;
    });

    if (!filtered.length) {
        grid.innerHTML = '<div class="alert alert-info">No meals match your filter.</div>';
        return;
    }

    grid.innerHTML = filtered.map((meal) => {
        const title = escapeHtml(meal.title || "Untitled Meal");
        const description = escapeHtml(meal.description || "Recipe imported from PreciousCore.");
        const cuisine = escapeHtml(meal.cuisine || "Cameroonian");
        const prep = Number(meal.prepTime || 0);
        const cook = Number(meal.cookTime || 0);
        const imageUrl = escapeHtml(meal.imageUrl || "/images/recipe-placeholder.png");
        const isFavorite = homeFavorites.has(meal.id);
        const favoriteLabel = isFavorite ? "Remove Favorite" : "Add Favorite";
        const favoriteClass = isFavorite ? "is-favorite" : "";

        return `
            <article class="home-meal-card">
                <img src="${imageUrl}" alt="${title}">
                <div class="home-meal-card-body">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="home-meal-meta">
                        <span>${cuisine}</span>
                        <span>${prep + cook} mins</span>
                    </div>
                    <div class="home-meal-actions">
                        <button type="button" class="btn admin-action-btn-outline btn-sm" data-action="open-recipe" data-id="${meal.id}">
                            <i class="fas fa-book-open"></i> View Recipe
                        </button>
                        <button type="button" class="btn btn-sm home-favorite-btn ${favoriteClass}" data-action="toggle-favorite" data-id="${meal.id}">
                            <i class="fas fa-heart"></i> ${favoriteLabel}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

async function openRecipeModal(id) {
    const response = await fetch(`/api/recipes/${id}`, {
        method: "GET",
        headers: buildAuthHeaders()
    });
    if (!response.ok) {
        return;
    }
    const recipe = await response.json();
    homeActiveRecipeId = id;

    const title = document.getElementById("homeRecipeModalTitle");
    const summary = document.getElementById("homeRecipeSummary");
    const meta = document.getElementById("homeRecipeMeta");
    const ingredients = document.getElementById("homeRecipeIngredients");
    const steps = document.getElementById("homeRecipeSteps");

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

    refreshModalFavoriteButton();
    if (homeRecipeModal) {
        homeRecipeModal.show();
    }
}

function formatIngredient(item) {
    if (!item) return "";
    const quantity = item.quantity ? `${item.quantity} ` : "";
    const unit = item.unit ? `${item.unit} ` : "";
    return `${quantity}${unit}${item.name || ""}`.trim();
}

async function toggleFavorite(id) {
    if (!id) return;
    const isFavorite = homeFavorites.has(id);
    const url = `/api/favorites/${id}`;
    const method = isFavorite ? "DELETE" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: buildAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to update favorite (${response.status})`);
        }

        if (isFavorite) {
            homeFavorites.delete(id);
        } else {
            homeFavorites.add(id);
        }
        updateFavoriteCount();
    } catch (error) {
        console.error("Favorite update error:", error);
    }
}

function refreshModalFavoriteButton() {
    const button = document.getElementById("homeModalFavoriteBtn");
    if (!button || !homeActiveRecipeId) {
        return;
    }
    const isFavorite = homeFavorites.has(homeActiveRecipeId);
    button.innerHTML = isFavorite
        ? '<i class="fas fa-heart-crack"></i> Remove from favorites'
        : '<i class="fas fa-heart"></i> Add to favorites';
}

function updateFavoriteCount() {
    const count = document.getElementById("homeFavoritesCount");
    if (count) {
        count.textContent = String(homeFavorites.size);
    }
}

function buildAuthHeaders() {
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
