import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const SITE = "https://www.preciouscore.com";
const CATEGORY_SLUG = "cameroonian-food";
const TARGET_COUNT = 100;
const PROJECT_ROOT = process.cwd();
const IMAGE_DIR = path.join(PROJECT_ROOT, "frontend", "static", "images", "recipes");
const OUTPUT_JSON = path.join(PROJECT_ROOT, "backend", "src", "main", "resources", "data", "preciouscore_cameroon_100.json");

async function fetchWithRetry(url, options = {}, attempts = 4) {
    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await fetch(url, options);
        } catch (error) {
            lastError = error;
            if (attempt < attempts) {
                await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
            }
        }
    }
    throw lastError;
}

async function fetchJson(url) {
    let lastError = null;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
        try {
            const res = await fetchWithRetry(url, {}, 2);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} for ${url}`);
            }
            return await res.json();
        } catch (error) {
            lastError = error;
            if (attempt < 4) {
                await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
            }
        }
    }
    throw lastError;
}

function decodeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, "-")
        .replace(/&#8212;/g, "-")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#038;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/Â/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function parseIsoDurationToMinutes(value, fallback) {
    if (!value || typeof value !== "string") return fallback;
    const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/i);
    if (!match) return fallback;
    const days = Number(match[1] || 0);
    const hours = Number(match[2] || 0);
    const mins = Number(match[3] || 0);
    const total = days * 24 * 60 + hours * 60 + mins;
    return total > 0 ? total : fallback;
}

function normalizeInstructions(rawInstructions) {
    if (!rawInstructions) return [];
    if (typeof rawInstructions === "string") {
        return [decodeHtml(rawInstructions)].filter(Boolean);
    }
    if (Array.isArray(rawInstructions)) {
        return rawInstructions
            .map((item) => {
                if (typeof item === "string") return decodeHtml(item);
                if (item && typeof item === "object") {
                    if (typeof item.text === "string") return decodeHtml(item.text);
                    if (typeof item.name === "string") return decodeHtml(item.name);
                }
                return "";
            })
            .filter(Boolean);
    }
    if (typeof rawInstructions === "object" && rawInstructions.text) {
        return [decodeHtml(rawInstructions.text)].filter(Boolean);
    }
    return [];
}

function cleanTextList(items, maxLength = 240) {
    return items
        .map((item) => decodeHtml(item))
        .map((item) => item.trim())
        .filter((item) => item.length >= 2 && item.length <= maxLength)
        .filter((item) => !looksLikeNoise(item));
}

function looksLikeNoise(value) {
    const lower = value.toLowerCase();
    return lower.includes("wprm-rating-star")
        || lower.includes("lineargradient#")
        || lower.includes("view recipe")
        || lower.includes("from 41 votes")
        || lower.includes("youtube channel");
}

function extractRecipeNode(obj) {
    if (!obj) return null;
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const found = extractRecipeNode(item);
            if (found) return found;
        }
        return null;
    }
    if (typeof obj !== "object") return null;
    const type = obj["@type"];
    const hasRecipeType = (Array.isArray(type) && type.includes("Recipe")) || type === "Recipe";
    if (hasRecipeType) return obj;
    if (obj["@graph"]) return extractRecipeNode(obj["@graph"]);
    for (const value of Object.values(obj)) {
        const found = extractRecipeNode(value);
        if (found) return found;
    }
    return null;
}

function extractFirstImageFromHtml(html) {
    if (!html) return null;
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
    }
    return null;
}

function extractOgImageFromHtml(html) {
    if (!html) return null;
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) {
        return ogMatch[1];
    }
    return null;
}

function getImageUrl(recipeNode, post, pageHtml) {
    const image = recipeNode?.image;
    if (typeof image === "string" && image) return image;
    if (Array.isArray(image) && image.length > 0) {
        const first = image[0];
        if (typeof first === "string") return first;
        if (first && typeof first.url === "string") return first.url;
    }
    if (image && typeof image === "object" && typeof image.url === "string") {
        return image.url;
    }
    return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url
        || extractFirstImageFromHtml(post?.content?.rendered || "")
        || extractFirstImageFromHtml(pageHtml)
        || extractOgImageFromHtml(pageHtml)
        || null;
}

function sanitizeFileName(value) {
    return value.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function inferExtension(url, contentType) {
    try {
        const pathname = new URL(url).pathname;
        const ext = path.extname(pathname).toLowerCase();
        if (ext && ext.length <= 5) return ext;
    } catch (error) {
        // Ignore parse errors.
    }
    if (contentType?.includes("png")) return ".png";
    if (contentType?.includes("webp")) return ".webp";
    return ".jpg";
}

async function downloadImage(url, fileBaseName) {
    if (!url) return null;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
        try {
            const res = await fetchWithRetry(url, {}, 2);
            if (!res.ok || !res.body) {
                return null;
            }
            const ext = inferExtension(url, res.headers.get("content-type"));
            const fileName = `${fileBaseName}${ext}`;
            const outPath = path.join(IMAGE_DIR, fileName);
            await pipeline(res.body, createWriteStream(outPath));
            return `/images/recipes/${fileName}`;
        } catch (error) {
            if (attempt < 4) {
                await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
                continue;
            }
            return null;
        }
    }
    return null;
}

function fallbackIngredients(contentHtml) {
    const matches = [...contentHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return matches
        .map((m) => decodeHtml(m[1]))
        .filter((item) => item.length > 2)
        .slice(0, 20);
}

function fallbackInstructions(contentHtml) {
    const ordered = [...contentHtml.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)];
    const items = [];
    for (const block of ordered) {
        const lis = [...block[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
        for (const li of lis) {
            const text = decodeHtml(li[1]);
            if (text) items.push(text);
        }
    }
    return items.slice(0, 20);
}

async function loadPostRecipe(post) {
    let html = "";
    let htmlLoaded = false;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
        try {
            const postHtmlRes = await fetchWithRetry(post.link, {}, 2);
            if (!postHtmlRes.ok) {
                throw new Error(`Failed HTML fetch ${post.link}`);
            }
            html = await postHtmlRes.text();
            htmlLoaded = true;
            break;
        } catch (error) {
            if (attempt < 4) {
                await new Promise((resolve) => setTimeout(resolve, 450 * attempt));
                continue;
            }
            throw error;
        }
    }
    if (!htmlLoaded) {
        return null;
    }
    const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

    let recipeNode = null;
    for (const script of scripts) {
        const jsonText = script[1].trim();
        if (!jsonText) continue;
        try {
            const parsed = JSON.parse(jsonText);
            recipeNode = extractRecipeNode(parsed);
            if (recipeNode) break;
        } catch (error) {
            // Ignore malformed blocks.
        }
    }

    if (!recipeNode) {
        return null;
    }

    const title = decodeHtml(post.title?.rendered || recipeNode?.name || post.slug || "Untitled");
    const description = decodeHtml(recipeNode?.description || post.excerpt?.rendered || "");
    const ingredientsFromSchema = Array.isArray(recipeNode?.recipeIngredient)
        ? recipeNode.recipeIngredient
        : fallbackIngredients(post.content?.rendered || "");
    const ingredients = cleanTextList(ingredientsFromSchema, 240).slice(0, 40);

    const instructionsFromSchema = normalizeInstructions(recipeNode?.recipeInstructions);
    const instructionsFallback = fallbackInstructions(post.content?.rendered || "");
    const finalInstructions = cleanTextList(
        instructionsFromSchema.length ? instructionsFromSchema : instructionsFallback,
        600
    ).slice(0, 40);

    if (ingredients.length < 3 || finalInstructions.length < 2) {
        return null;
    }

    const prepTime = parseIsoDurationToMinutes(recipeNode?.prepTime, 20);
    const cookTime = parseIsoDurationToMinutes(recipeNode?.cookTime, 35);
    const servingsRaw = recipeNode?.recipeYield;
    const servings = Number(
        Array.isArray(servingsRaw)
            ? String(servingsRaw[0]).match(/\d+/)?.[0]
            : String(servingsRaw || "").match(/\d+/)?.[0]
    ) || 4;
    const difficulty = "MEDIUM";
    const cuisine = "Cameroonian";
    const imageSource = getImageUrl(recipeNode, post, html);
    const imageSlug = sanitizeFileName(post.slug || title.toLowerCase());
    const localImageUrl = await downloadImage(imageSource, imageSlug);
    if (!localImageUrl) {
        return null;
    }

    return {
        title,
        description,
        sourceUrl: post.link,
        imageSourceUrl: imageSource,
        imageUrl: localImageUrl,
        prepTime,
        cookTime,
        servings,
        difficulty,
        cuisine,
        tags: ["cameroonian-food", "preciouscore"],
        ingredients: ingredients.map((text) => ({
            name: text,
            quantity: "1",
            unit: "portion",
            notes: null
        })),
        instructions: finalInstructions.map((text, idx) => ({
            step: idx + 1,
            description: text,
            duration: null
        }))
    };
}

async function run() {
    await mkdir(IMAGE_DIR, { recursive: true });
    await mkdir(path.dirname(OUTPUT_JSON), { recursive: true });

    const cats = await fetchJson(`${SITE}/wp-json/wp/v2/categories?slug=${CATEGORY_SLUG}`);
    if (!Array.isArray(cats) || !cats.length) {
        throw new Error(`Category ${CATEGORY_SLUG} not found`);
    }
    const categoryId = cats[0].id;

    const posts = [];
    let page = 1;
    while (true) {
        const url = `${SITE}/wp-json/wp/v2/posts?categories=${categoryId}&per_page=100&page=${page}&_embed`;
        const batch = await fetchJson(url);
        if (!Array.isArray(batch) || !batch.length) break;
        posts.push(...batch);
        if (batch.length < 100) break;
        page += 1;
    }

    const recipes = [];
    for (let i = 0; i < posts.length; i += 1) {
        if (recipes.length >= TARGET_COUNT) {
            break;
        }
        const post = posts[i];
        try {
            const recipe = await loadPostRecipe(post);
            if (!recipe) {
                console.log(`[${i + 1}/${posts.length}] skipped ${post.link}`);
                continue;
            }
            recipes.push(recipe);
            console.log(`[${i + 1}/${posts.length}] imported ${recipe.title}`);
        } catch (error) {
            console.log(`[${i + 1}/${posts.length}] failed ${post.link}: ${error.message}`);
        }
    }

    if (recipes.length < TARGET_COUNT) {
        throw new Error(`Only ${recipes.length} valid recipes found; expected ${TARGET_COUNT}.`);
    }

    await writeFile(OUTPUT_JSON, JSON.stringify(recipes, null, 2), "utf8");
    console.log(`Saved ${recipes.length} recipes to ${OUTPUT_JSON}`);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
