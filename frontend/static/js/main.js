const CAMEROONIAN_MEALS = {
    "jollof-rice": {
        name: "Cameroon Jollof Rice",
        summary: "A one-pot rice dish built with tomato base, aromatics, and mixed vegetables.",
        prepTime: "15 mins",
        cookTime: "60 mins",
        serves: "6",
        spiceLevel: "Medium",
        ingredients: [
            "Long grain rice",
            "Tomatoes and tomato paste",
            "Onion and garlic",
            "Bell pepper and green beans",
            "Carrot and peas",
            "Chicken stock",
            "Curry powder and white pepper",
            "Vegetable oil and salt"
        ],
        steps: [
            "Blend tomatoes, peppers, onion, and garlic, then cook the blend until it reduces and darkens slightly.",
            "Stir in tomato paste, seasonings, and stock to build a rich stew base.",
            "Add washed rice and cook covered on low heat until almost tender.",
            "Fold in vegetables and continue cooking until the rice is soft and fluffy.",
            "Adjust salt and spice, then rest for 5 minutes before serving."
        ],
        servingIdeas: "Serve with fried plantain, grilled chicken, or fish.",
        swapTip: "Use basmati for lighter grains, but reduce liquid slightly.",
        sourceUrl: "https://www.preciouscore.com/cameroon-jollof-rice-easy-method/"
    },
    "achu-yellow-soup": {
        name: "Achu and Yellow Soup",
        summary: "A classic meal of smooth pounded cocoyam and warmly spiced yellow soup.",
        prepTime: "30 mins",
        cookTime: "60' mins",
        serves: "4",
        spiceLevel: "Medium-Hot",
        ingredients: [
            "Achu spice blend",
            "Canwa or limestone water (traditionally used for texture)",
            "Palm oil",
            "Beef stock and cooked beef",
            "Warm water",
            "Habanero pepper",
            "Salt",
            "Boiled cocoyam for achu"
        ],
        steps: [
            "Boil cocoyam until very soft, then pound until stretchy and smooth.",
            "Mix warm stock with spice blend and canwa water to form the soup base.",
            "Stream in palm oil while stirring to get the yellow emulsion.",
            "Add beef pieces and pepper, then simmer briefly for flavor balance.",
            "Serve the yellow soup beside molded achu and eat while hot."
        ],
        servingIdeas: "Pair with boiled cow skin, tripe, or fish depending on preference.",
        swapTip: "If canwa is unavailable, use only stock and warm water for a milder version.",
        sourceUrl: "https://www.preciouscore.com/how-to-make-achu-and-yellow-soup/"
    },
    "fufu-corn": {
        name: "Fufu Corn",
        summary: "A firm, smooth cornmeal staple that pairs well with leafy soups and stews.",
        prepTime: "10 mins",
        cookTime: "20 mins",
        serves: "4",
        spiceLevel: "Not spicy",
        ingredients: [
            "Fine corn flour",
            "Water",
            "A pinch of salt (optional)"
        ],
        steps: [
            "Bring water to a boil in a heavy pot.",
            "Sprinkle in corn flour gradually while stirring to avoid lumps.",
            "Cook and stir constantly until the mixture thickens and pulls together.",
            "Knead with a wooden spoon over low heat to develop a smooth texture.",
            "Shape into portions and serve hot with soup."
        ],
        servingIdeas: "Best with eru, ndole, okra soup, or njangsa sauce.",
        swapTip: "For softer texture, increase water a little and stir longer.",
        sourceUrl: "https://www.preciouscore.com/fufu-corn-cameroonian-corn-fufu/"
    },
    ekwang: {
        name: "Ekwang",
        summary: "Grated cocoyam wrapped in cocoyam leaves and simmered in a seasoned palm-oil sauce.",
        prepTime: "60 mins",
        cookTime: "30 mins",
        serves: "6",
        spiceLevel: "Medium",
        ingredients: [
            "Cocoyam and cocoyam leaves",
            "Palm oil",
            "Tomatoes, onion, and garlic",
            "Crayfish",
            "Smoked fish or meat",
            "Salt and seasoning",
            "Pepper",
            "Water or light stock"
        ],
        steps: [
            "Grate peeled cocoyam into a smooth mash.",
            "Wrap spoonfuls of cocoyam mash in cocoyam leaves.",
            "Layer wraps in a pot with fish or meat and aromatics.",
            "Add palm oil, crayfish, and enough liquid, then cook gently until the wraps are tender.",
            "Taste and adjust seasoning, then serve warm."
        ],
        servingIdeas: "Serve as a full meal with extra smoked fish on top.",
        swapTip: "Spinach can stand in for cocoyam leaves when unavailable.",
        sourceUrl: "https://www.preciouscore.com/ekwang-a-cameroon-delicacy/"
    },
    "njangsa-sauce": {
        name: "Njangsa Sauce",
        summary: "A nutty, creamy Cameroonian sauce made with ground njangsa seeds and fish.",
        prepTime: "20 mins",
        cookTime: "25 mins",
        serves: "5",
        spiceLevel: "Mild-Medium",
        ingredients: [
            "Ground njangsa seeds",
            "Tomatoes and onion",
            "Garlic and parsley",
            "Palm oil or vegetable oil",
            "Smoked fish or fresh fish",
            "Scotch bonnet or mild pepper",
            "Stock or water",
            "Salt and seasoning"
        ],
        steps: [
            "Blend tomatoes, onions, and herbs until smooth.",
            "Cook the blend in oil until raw acidity reduces.",
            "Add njangsa paste and stir while adding stock gradually.",
            "Add fish and simmer gently until sauce thickens and flavors combine.",
            "Finish with pepper and serve hot."
        ],
        servingIdeas: "Excellent with boiled yam, rice, cocoyam, or ripe plantain.",
        swapTip: "Ground melon seed can be used if njangsa is unavailable.",
        sourceUrl: "https://www.preciouscore.com/njangsa-sauce/"
    },
    "koki-corn": {
        name: "Koki Corn",
        summary: "Fresh blended corn batter wrapped in leaves and steamed into a soft savory pudding.",
        prepTime: "30 mins",
        cookTime: "30 mins",
        serves: "6",
        spiceLevel: "Mild",
        ingredients: [
            "Fresh corn kernels",
            "Red palm oil",
            "Onion",
            "Crayfish (optional)",
            "Salt and seasoning",
            "Banana leaves or foil for wrapping"
        ],
        steps: [
            "Blend corn with onion to a thick batter.",
            "Mix in palm oil, salt, and optional crayfish.",
            "Wrap batter in banana leaves and tie securely.",
            "Steam in a covered pot until the wraps are firm.",
            "Cool slightly, unwrap, and serve."
        ],
        servingIdeas: "Serve with ripe plantain, avocado, or boiled cassava.",
        swapTip: "Use foil wraps if banana leaves are not available.",
        sourceUrl: "https://www.preciouscore.com/koki-corn-fresh-corn-pudding/"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initRevealSections();
    initMealRecipes();
    initLandingAuthControls();
    initHomeRecipesFeed();
});

function initRevealSections() {
    const revealSections = document.querySelectorAll(".reveal-section");
    if (!revealSections.length) {
        return;
    }

    const revealOnScroll = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    revealSections.forEach((section) => revealOnScroll.observe(section));
}

function initMealRecipes() {
    const mealCards = document.querySelectorAll(".meal-card-v2");
    if (!mealCards.length) {
        return;
    }

    const recipeHint = document.getElementById("recipeLoginHint");
    const recipeModalElement = document.getElementById("mealRecipeModal");
    const loginModalElement = document.getElementById("mealLoginModal");
    const recipeModal = recipeModalElement && window.bootstrap ? new window.bootstrap.Modal(recipeModalElement) : null;
    const loginModal = loginModalElement && window.bootstrap ? new window.bootstrap.Modal(loginModalElement) : null;
    const chatbot = initMealChatbot();

    updateRecipeGateState(mealCards, recipeHint);

    mealCards.forEach((card) => {
        card.addEventListener("click", () => {
            const meal = CAMEROONIAN_MEALS[card.dataset.mealId];
            if (!meal) {
                return;
            }

            if (!isAuthenticated()) {
                if (loginModal) {
                    loginModal.show();
                } else {
                    window.location.href = "/login";
                }
                return;
            }

            populateRecipeModal(meal);
            if (recipeModal) {
                recipeModal.show();
            }
            chatbot.activateForMeal(meal);
        });
    });
}

function isAuthenticated() {
    return Boolean(localStorage.getItem("token"));
}

function initLandingAuthControls() {
    const navActions = document.querySelector(".landing-nav-actions");
    if (!navActions) {
        return;
    }

    if (!isAuthenticated()) {
        return;
    }

    navActions.innerHTML = `
        <a href="/dashboard" class="landing-login-link">Dashboard</a>
        <button type="button" class="landing-login-btn landing-login-btn-v2" id="landingLogoutBtn">Logout</button>
    `;

    const logoutButton = document.getElementById("landingLogoutBtn");
    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", () => {
        if (window.authService && typeof window.authService.logout === "function") {
            window.authService.logout();
            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        document.cookie = "AUTH_TOKEN=; Max-Age=0; Path=/; SameSite=Lax";
        window.location.href = "/login";
    });
}

async function initHomeRecipesFeed() {
    const status = document.getElementById("homeRecipesStatus");
    const grid = document.getElementById("homeRecipesGrid");
    if (!status || !grid) {
        return;
    }

    if (!isAuthenticated()) {
        status.innerHTML = 'Log in to see your Home recipes feed. <a href="/login">Login now</a>.';
        grid.innerHTML = "";
        return;
    }

    status.textContent = "Loading recipes from database...";
    try {
        const response = await fetch("/api/recipes/recent", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Failed to load recipes");
        }

        const recipes = await response.json();
        if (!Array.isArray(recipes) || !recipes.length) {
            status.textContent = "No recipes in the database yet.";
            grid.innerHTML = "";
            return;
        }

        status.textContent = "Latest recipes saved in the database.";
        grid.innerHTML = recipes.map((recipe) => {
            const title = escapeHtml(recipe.title || "Untitled Recipe");
            const cuisine = escapeHtml(recipe.cuisine || "General");
            const difficulty = escapeHtml((recipe.difficulty || "N/A").toUpperCase());
            const prep = Number(recipe.prepTime || 0);
            const cook = Number(recipe.cookTime || 0);
            const description = escapeHtml(recipe.description || "Newly published recipe from PlanYaChop.");

            return `
                <article class="home-recipe-card">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="home-recipe-meta">
                        <span>${cuisine}</span>
                        <span>${difficulty}</span>
                        <span>${prep + cook} mins</span>
                    </div>
                    <a href="/dashboard" class="home-recipe-link">View in dashboard</a>
                </article>
            `;
        }).join("");
    } catch (error) {
        console.error("Home recipes load error:", error);
        status.textContent = "Could not load recipes right now.";
        grid.innerHTML = "";
    }
}

function updateRecipeGateState(mealCards, recipeHint) {
    const loggedIn = isAuthenticated();
    mealCards.forEach((card) => {
        card.classList.toggle("is-locked", !loggedIn);
    });
    if (recipeHint) {
        recipeHint.textContent = loggedIn
            ? "You are logged in. Click any meal to open the full recipe and chat."
            : "Log in to open full recipes.";
    }
}

function populateRecipeModal(meal) {
    const title = document.getElementById("mealRecipeModalTitle");
    const summary = document.getElementById("recipeSummary");
    const meta = document.getElementById("recipeMeta");
    const ingredients = document.getElementById("recipeIngredients");
    const steps = document.getElementById("recipeSteps");
    const sourceLink = document.getElementById("recipeSourceLink");

    if (!title || !summary || !meta || !ingredients || !steps || !sourceLink) {
        return;
    }

    title.textContent = meal.name;
    summary.textContent = meal.summary;

    meta.innerHTML = "";
    [
        `Prep: ${meal.prepTime}`,
        `Cook: ${meal.cookTime}`,
        `Serves: ${meal.serves}`,
        `Spice: ${meal.spiceLevel}`
    ].forEach((item) => {
        const tag = document.createElement("span");
        tag.className = "recipe-meta-tag";
        tag.textContent = item;
        meta.appendChild(tag);
    });

    ingredients.innerHTML = "";
    meal.ingredients.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ingredients.appendChild(li);
    });

    steps.innerHTML = "";
    meal.steps.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        steps.appendChild(li);
    });

    sourceLink.href = meal.sourceUrl;
}

function initMealChatbot() {
    const chatbotElement = document.getElementById("mealChatbot");
    const subtitleElement = document.getElementById("mealChatSubtitle");
    const messagesElement = document.getElementById("mealChatMessages");
    const quickActionsElement = document.getElementById("mealChatQuickActions");
    const formElement = document.getElementById("mealChatForm");
    const inputElement = document.getElementById("mealChatInput");
    const closeButton = document.getElementById("mealChatClose");

    if (!chatbotElement || !subtitleElement || !messagesElement || !quickActionsElement || !formElement || !inputElement || !closeButton) {
        return { activateForMeal: () => {} };
    }

    const quickPrompts = [
        "What ingredients do I need?",
        "How long does this meal take?",
        "How should I serve it?",
        "Any easy substitutions?"
    ];

    let activeMeal = null;

    closeButton.addEventListener("click", () => {
        chatbotElement.classList.remove("is-open");
    });

    formElement.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!isAuthenticated()) {
            window.location.href = "/login";
            return;
        }
        const question = inputElement.value.trim();
        if (!question) {
            return;
        }

        if (!activeMeal) {
            pushChatMessage("bot", "Pick a meal card first so I can answer with recipe-specific tips.");
            inputElement.value = "";
            return;
        }

        pushChatMessage("user", question);
        inputElement.value = "";
        window.setTimeout(() => {
            pushChatMessage("bot", generateMealResponse(question, activeMeal));
        }, 180);
    });

    function activateForMeal(meal) {
        activeMeal = meal;
        subtitleElement.textContent = meal.name;
        messagesElement.innerHTML = "";
        quickActionsElement.innerHTML = "";
        chatbotElement.classList.add("is-open");

        pushChatMessage("bot", `Great choice. ${meal.name} is ${meal.summary.toLowerCase()}`);
        pushChatMessage("bot", "Ask me about ingredients, timing, serving ideas, or substitutions.");

        quickPrompts.forEach((prompt) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "meal-chat-chip";
            button.textContent = prompt;
            button.addEventListener("click", () => {
                if (!isAuthenticated()) {
                    window.location.href = "/login";
                    return;
                }
                pushChatMessage("user", prompt);
                window.setTimeout(() => {
                    pushChatMessage("bot", generateMealResponse(prompt, activeMeal));
                }, 140);
            });
            quickActionsElement.appendChild(button);
        });
    }

    function pushChatMessage(role, text) {
        const message = document.createElement("div");
        message.className = `meal-chat-msg meal-chat-msg-${role}`;
        message.textContent = text;
        messagesElement.appendChild(message);
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    return { activateForMeal };
}

function generateMealResponse(question, meal) {
    const query = question.toLowerCase();

    if (hasAny(query, ["ingredient", "need", "use", "items"])) {
        return `Start with ${meal.ingredients.slice(0, 6).join(", ")}. You can then add optional extras based on taste.`;
    }

    if (hasAny(query, ["time", "long", "minutes", "cook"])) {
        return `${meal.name} takes about ${meal.prepTime} prep and ${meal.cookTime} cooking time.`;
    }

    if (hasAny(query, ["serve", "pair", "side", "eat"])) {
        return meal.servingIdeas;
    }

    if (hasAny(query, ["substitute", "swap", "replace", "alternative"])) {
        return meal.swapTip;
    }

    if (hasAny(query, ["step", "method", "how", "make"])) {
        return `Quick method: ${meal.steps.slice(0, 3).join(" ")}`;
    }

    if (hasAny(query, ["spicy", "pepper", "hot"])) {
        return `${meal.name} is usually ${meal.spiceLevel}. You can raise or reduce pepper to suit your taste.`;
    }

    if (hasAny(query, ["source", "reference", "link"])) {
        return `Reference: ${meal.sourceUrl}`;
    }

    return `For ${meal.name}, I can help with ingredients, timing, method steps, serving ideas, or substitutions.`;
}

function hasAny(value, words) {
    return words.some((word) => value.includes(word));
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
