document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.startsWith("/admin")) {
        return;
    }

    initAdminPortal();
});

async function initAdminPortal() {
    bindRecipeForm();
    bindAdminCapabilityLinks();
    await Promise.all([
        loadAdminOverview(),
        loadRecentAdminRecipes(),
        loadAdminUsers(),
        loadSystemLogs(),
        loadMealPlanUsage(),
        loadModerationQueue()
    ]);
    setInterval(loadSystemLogs, 20000);
}

function bindRecipeForm() {
    const form = document.getElementById("adminCreateRecipeForm");
    const submitBtn = document.getElementById("adminCreateRecipeBtn");
    const refreshBtn = document.getElementById("refreshAdminRecipesBtn");

    if (refreshBtn) {
        refreshBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            await loadRecentAdminRecipes();
        });
    }

    if (!form || !submitBtn || form.dataset.bound === "true") {
        return;
    }
    form.dataset.bound = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const payload = buildRecipePayload();
        const editingId = submitBtn.dataset.editingId;
        toggleButtonBusy(submitBtn, true, "Saving...");
        hideAlert();

        try {
            const isEditing = !!editingId;
            const response = await fetch(isEditing ? `/api/admin/recipes/${editingId}` : "/api/admin/recipes", {
                method: isEditing ? "PUT" : "POST",
                headers: buildApiHeaders(),
                body: JSON.stringify(payload)
            });
            const { data, text } = await readResponsePayload(response);
            if (!response.ok) {
                throw new Error(resolveErrorMessage(data, text, isEditing ? "Failed to update recipe." : "Failed to save recipe."));
            }

            showAlert(isEditing ? "Recipe updated successfully." : "Recipe saved successfully.", "success");
            form.reset();
            resetRecipeDefaults();
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Save Recipe';
            delete submitBtn.dataset.editingId;
            await Promise.all([loadRecentAdminRecipes(), loadAdminOverview()]);
        } catch (error) {
            showAlert(error.message || "Recipe action failed.", "danger");
        } finally {
            const label = submitBtn.dataset.editingId
                ? '<i class="fas fa-pen"></i> Update Recipe'
                : '<i class="fas fa-plus"></i> Save Recipe';
            toggleButtonBusy(submitBtn, false, label);
        }
    });
}

function bindAdminCapabilityLinks() {
    document.querySelectorAll("[data-scroll-target]").forEach((button) => {
        button.addEventListener("click", () => {
            const selector = button.getAttribute("data-scroll-target");
            if (!selector) {
                return;
            }
            const target = document.querySelector(selector);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

async function loadAdminOverview() {
    try {
        const response = await fetch("/api/admin/dashboard", {
            method: "GET",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to load dashboard overview."));
        }
        renderOverview(data || {});
    } catch (error) {
        console.error("Overview load error:", error);
    }
}

function renderOverview(data) {
    setText("metricTotalUsers", number(data.totalUsers));
    setText("metricTotalRecipes", number(data.totalRecipes));
    setText("metricMealPlans", number(data.mealPlans));
    setText("metricSystemHealth", String(data.systemHealth || "Unknown"));

    renderPopularRecipes(Array.isArray(data.popularRecipes) ? data.popularRecipes : []);
    renderRecentActivity(Array.isArray(data.recentActivity) ? data.recentActivity : []);
}

function renderPopularRecipes(rows) {
    const list = document.getElementById("popularRecipesList");
    const empty = document.getElementById("popularRecipesEmpty");
    if (!list || !empty) return;

    if (!rows.length) {
        list.innerHTML = "";
        empty.classList.remove("d-none");
        return;
    }

    list.innerHTML = rows.map((row) => {
        const title = escapeHtml(row.title || "Untitled");
        const views = number(row.views);
        const saves = number(row.saves);
        return `
            <li class="admin-list-item">
                <div>
                    <strong>${title}</strong>
                    <small>${views} views • ${saves} saves</small>
                </div>
            </li>
        `;
    }).join("");
    empty.classList.add("d-none");
}

function renderRecentActivity(rows) {
    const list = document.getElementById("recentActivityList");
    const empty = document.getElementById("recentActivityEmpty");
    if (!list || !empty) return;

    if (!rows.length) {
        list.innerHTML = "";
        empty.classList.remove("d-none");
        return;
    }

    list.innerHTML = rows.map((row) => `
        <li class="admin-list-item">
            <div>
                <strong>${escapeHtml(row.action || "EVENT")}</strong>
                <small>${escapeHtml(row.username || "system")} • ${formatDate(row.createdAt)}</small>
            </div>
            <p>${escapeHtml(row.message || "")}</p>
        </li>
    `).join("");
    empty.classList.add("d-none");
}

async function loadRecentAdminRecipes() {
    const list = document.getElementById("adminRecentRecipesList");
    const empty = document.getElementById("adminRecentRecipesEmpty");
    if (!list || !empty) return;

    try {
        const response = await fetch("/api/admin/recipes/recent?limit=12", {
            method: "GET",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to load recipes."));
        }
        renderRecentRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Recent recipe load error:", error);
    }
}

function renderRecentRecipes(recipes) {
    const list = document.getElementById("adminRecentRecipesList");
    const empty = document.getElementById("adminRecentRecipesEmpty");
    if (!list || !empty) return;

    if (!recipes.length) {
        list.innerHTML = "";
        empty.classList.remove("d-none");
        return;
    }

    list.innerHTML = recipes.map((recipe) => `
        <li class="admin-list-item">
            <div>
                <strong>${escapeHtml(recipe.title || "Untitled")}</strong>
                <small>${escapeHtml(recipe.mealType || "DINNER")} • ${escapeHtml(recipe.cuisine || "General")} • ${number(recipe.prepTime) + number(recipe.cookTime)} mins</small>
            </div>
            <div class="admin-inline-actions">
                <button class="btn admin-action-btn-outline btn-sm" data-action="edit-recipe" data-id="${recipe.id}">Edit</button>
                <button class="btn admin-action-btn-outline btn-sm" data-action="delete-recipe" data-id="${recipe.id}">Delete</button>
            </div>
        </li>
    `).join("");
    empty.classList.add("d-none");

    list.querySelectorAll("[data-action='edit-recipe']").forEach((button) => {
        button.addEventListener("click", () => openRecipeEditor(recipes, Number(button.dataset.id)));
    });
    list.querySelectorAll("[data-action='delete-recipe']").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = Number(button.dataset.id);
            await deleteRecipe(id);
        });
    });
}

function openRecipeEditor(recipes, recipeId) {
    const recipe = recipes.find((r) => Number(r.id) === recipeId);
    if (!recipe) return;

    setValue("adminRecipeTitle", recipe.title || "");
    setValue("adminRecipeDescription", recipe.description || "");
    setValue("adminRecipePrepTime", String(number(recipe.prepTime || 15)));
    setValue("adminRecipeCookTime", String(number(recipe.cookTime || 30)));
    setValue("adminRecipeServings", String(number(recipe.servings || 4)));
    setValue("adminRecipeDifficulty", String(recipe.difficulty || "EASY"));
    setValue("adminRecipeMealType", String(recipe.mealType || "DINNER"));
    setValue("adminRecipeCuisine", recipe.cuisine || "");
    setValue("adminRecipeTags", Array.isArray(recipe.tags) ? recipe.tags.join(", ") : "");
    setValue("adminRecipeImageUrl", recipe.imageUrl || "");
    setValue("adminRecipeIngredients", Array.isArray(recipe.ingredients) ? recipe.ingredients.join("\n") : "");
    setValue("adminRecipeInstructions", Array.isArray(recipe.instructions) ? recipe.instructions.join("\n") : "");

    const submitBtn = document.getElementById("adminCreateRecipeBtn");
    if (!submitBtn) return;
    submitBtn.innerHTML = '<i class="fas fa-pen"></i> Update Recipe';
    submitBtn.dataset.editingId = String(recipe.id);
    const form = document.getElementById("adminCreateRecipeForm");
    if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

async function deleteRecipe(id) {
    if (!id) return;
    if (!window.confirm("Delete this recipe?")) return;

    try {
        const response = await fetch(`/api/admin/recipes/${id}`, {
            method: "DELETE",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to delete recipe."));
        }
        showAlert("Recipe deleted successfully.", "success");
        await Promise.all([loadRecentAdminRecipes(), loadAdminOverview()]);
    } catch (error) {
        showAlert(error.message || "Delete failed.", "danger");
    }
}

async function loadAdminUsers() {
    const list = document.getElementById("adminUsersList");
    const empty = document.getElementById("adminUsersEmpty");
    if (!list || !empty) return;

    try {
        const response = await fetch("/api/admin/dashboard/users?limit=50", {
            method: "GET",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to load users."));
        }
        renderUsers(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("User load error:", error);
    }
}

function renderUsers(users) {
    const list = document.getElementById("adminUsersList");
    const empty = document.getElementById("adminUsersEmpty");
    if (!list || !empty) return;

    if (!users.length) {
        list.innerHTML = "";
        empty.classList.remove("d-none");
        return;
    }

    list.innerHTML = users.map((user) => {
        const role = escapeHtml(user.role || "USER");
        const enabled = !!user.enabled;
        return `
            <li class="admin-list-item">
                <div>
                    <strong>${escapeHtml(user.username || "unknown")}</strong>
                    <small>${escapeHtml(user.email || "")} • ${role}</small>
                </div>
                <div class="admin-inline-actions">
                    <button class="btn admin-action-btn-outline btn-sm" data-action="toggle-user" data-id="${user.id}" data-enabled="${enabled}">
                        ${enabled ? "Disable" : "Enable"}
                    </button>
                    <button class="btn admin-action-btn-outline btn-sm" data-action="delete-user" data-id="${user.id}">Delete</button>
                </div>
            </li>
        `;
    }).join("");
    empty.classList.add("d-none");

    list.querySelectorAll("[data-action='toggle-user']").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = Number(button.dataset.id);
            const enabled = button.dataset.enabled === "true";
            await updateUserEnabled(id, !enabled);
        });
    });

    list.querySelectorAll("[data-action='delete-user']").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = Number(button.dataset.id);
            await deleteUser(id);
        });
    });
}

async function updateUserEnabled(id, enabled) {
    try {
        const response = await fetch(`/api/admin/dashboard/users/${id}/enabled`, {
            method: "PATCH",
            headers: buildApiHeaders(),
            body: JSON.stringify({ enabled })
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to update user."));
        }
        showAlert(`User ${enabled ? "enabled" : "disabled"} successfully.`, "success");
        await loadAdminUsers();
    } catch (error) {
        showAlert(error.message || "User update failed.", "danger");
    }
}

async function deleteUser(id) {
    if (!window.confirm("Delete this user account?")) return;
    try {
        const response = await fetch(`/api/admin/dashboard/users/${id}`, {
            method: "DELETE",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to delete user."));
        }
        showAlert("User deleted successfully.", "success");
        await Promise.all([loadAdminUsers(), loadAdminOverview()]);
    } catch (error) {
        showAlert(error.message || "Delete user failed.", "danger");
    }
}

async function loadSystemLogs() {
    const list = document.getElementById("systemLogsList");
    const empty = document.getElementById("systemLogsEmpty");
    if (!list || !empty) return;

    try {
        const response = await fetch("/api/admin/dashboard/logs?limit=25", {
            method: "GET",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to load logs."));
        }

        const logs = Array.isArray(data) ? data : [];
        if (!logs.length) {
            list.innerHTML = "";
            empty.classList.remove("d-none");
            return;
        }

        list.innerHTML = logs.map((log) => `
            <li class="admin-list-item">
                <div>
                    <strong>${escapeHtml(log.level || "INFO")} • ${escapeHtml(log.action || "EVENT")}</strong>
                    <small>${escapeHtml(log.username || "system")} • ${formatDate(log.createdAt)}</small>
                </div>
                <p>${escapeHtml(log.message || "")}</p>
            </li>
        `).join("");
        empty.classList.add("d-none");
    } catch (error) {
        console.error("System log load error:", error);
    }
}

async function loadMealPlanUsage() {
    const list = document.getElementById("mealPlanUsageList");
    const empty = document.getElementById("mealPlanUsageEmpty");
    if (!list || !empty) return;

    try {
        const response = await fetch("/api/admin/dashboard/meal-plan-usage", {
            method: "GET",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to load meal plan usage."));
        }
        const rows = Array.isArray(data) ? data : [];
        if (!rows.length) {
            list.innerHTML = "";
            empty.classList.remove("d-none");
            return;
        }
        list.innerHTML = rows.map((row) => `
            <li class="admin-list-item">
                <div>
                    <strong>${escapeHtml(row.day || "")}</strong>
                    <small>${number(row.requests)} meal plan requests</small>
                </div>
            </li>
        `).join("");
        empty.classList.add("d-none");
    } catch (error) {
        console.error("Meal usage load error:", error);
    }
}

async function loadModerationQueue() {
    const list = document.getElementById("moderationList");
    const empty = document.getElementById("moderationEmpty");
    if (!list || !empty) return;

    try {
        const response = await fetch("/api/admin/dashboard/moderation", {
            method: "GET",
            headers: buildApiHeaders()
        });
        const { data, text } = await readResponsePayload(response);
        if (!response.ok) {
            throw new Error(resolveErrorMessage(data, text, "Failed to load moderation queue."));
        }
        const rows = Array.isArray(data) ? data : [];
        if (!rows.length) {
            list.innerHTML = "";
            empty.classList.remove("d-none");
            return;
        }
        list.innerHTML = rows.map((row) => `
            <li class="admin-list-item">
                <div>
                    <strong>${escapeHtml(row.action || "EVENT")}</strong>
                    <small>${escapeHtml(row.username || "system")} • ${formatDate(row.createdAt)}</small>
                </div>
                <p>${escapeHtml(row.message || "")}</p>
            </li>
        `).join("");
        empty.classList.add("d-none");
    } catch (error) {
        console.error("Moderation load error:", error);
    }
}

function buildRecipePayload() {
    return {
        title: (document.getElementById("adminRecipeTitle")?.value || "").trim(),
        description: (document.getElementById("adminRecipeDescription")?.value || "").trim(),
        prepTime: number(document.getElementById("adminRecipePrepTime")?.value),
        cookTime: number(document.getElementById("adminRecipeCookTime")?.value),
        servings: number(document.getElementById("adminRecipeServings")?.value),
        difficulty: (document.getElementById("adminRecipeDifficulty")?.value || "EASY").trim(),
        mealType: (document.getElementById("adminRecipeMealType")?.value || "DINNER").trim(),
        cuisine: (document.getElementById("adminRecipeCuisine")?.value || "").trim(),
        tags: parseTags(document.getElementById("adminRecipeTags")?.value || ""),
        imageUrl: (document.getElementById("adminRecipeImageUrl")?.value || "").trim(),
        ingredientLines: parseLines(document.getElementById("adminRecipeIngredients")?.value || ""),
        instructionLines: parseLines(document.getElementById("adminRecipeInstructions")?.value || "")
    };
}

function parseTags(input) {
    return String(input)
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
}

function parseLines(input) {
    return String(input)
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function resetRecipeDefaults() {
    setValue("adminRecipeDifficulty", "EASY");
    setValue("adminRecipeMealType", "DINNER");
    setValue("adminRecipePrepTime", "15");
    setValue("adminRecipeCookTime", "30");
    setValue("adminRecipeServings", "4");
}

function showAlert(message, type) {
    const alertBox = document.getElementById("adminRecipeFormAlert");
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} mb-3`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
}

function hideAlert() {
    const alertBox = document.getElementById("adminRecipeFormAlert");
    if (!alertBox) return;
    alertBox.classList.add("d-none");
    alertBox.textContent = "";
}

function buildApiHeaders() {
    const headers = { "Content-Type": "application/json" };
    const authHeader = window.authService?.getAuthHeader?.();
    if (authHeader) {
        headers.Authorization = authHeader;
    }
    return headers;
}

async function readResponsePayload(response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try {
            return { data: await response.json(), text: "" };
        } catch (error) {
            return { data: null, text: "" };
        }
    }
    try {
        return { data: null, text: await response.text() };
    } catch (error) {
        return { data: null, text: "" };
    }
}

function resolveErrorMessage(data, text, fallback) {
    if (data && typeof data.message === "string" && data.message.trim()) return data.message.trim();
    if (text && text.trim()) return text.trim();
    return fallback;
}

function toggleButtonBusy(button, busy, label) {
    if (!button) return;
    button.disabled = busy;
    button.innerHTML = label;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value);
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value) {
    if (!value) return "Unknown time";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
