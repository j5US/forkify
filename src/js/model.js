import { async } from "regenerator-runtime";
import { API_URL, RES_PER_PAGE, KEY } from "./config.js";
// import { getJSON, sendJSON } from "./helpers.js";
import { AJAX } from "./helpers.js";

export const state = {
    recipe: {},
    search: {
        page: 1,
        query: "",
        resultsPerPage: RES_PER_PAGE,
        results: [],
    },
    bookmarks: [],
};

const createRecipeObject = function (data) {
    const { recipe } = data.data;

    return {
        cookingTime: recipe.cooking_time,
        id: recipe.id,
        image: recipe.image_url,
        ingredients: recipe.ingredients,
        publisher: recipe.publisher,
        servings: recipe.servings,
        sourceUrl: recipe.source_url,
        title: recipe.title,
        ...(recipe.key && { key: recipe.key }),
    };
}

export const loadRecipe = async function (id) {
    try {

        // const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bcc40`);

        // const data = await getJSON(`${API_URL}${id}`);
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

        state.recipe = createRecipeObject(data);

        // console.log(recipe);
        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;
    }
    catch (err) {
        console.error(`${err} 🔥🔥🔥🔥`);
        throw err;
    }
};

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        // const data = await getJSON(`${API_URL}?search=${query}`);
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // console.log(data);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                image: rec.image_url,
                publisher: rec.publisher,
                title: rec.title,
                ...(rec.key && { key: rec.key }),
            };
        });
        state.search.page = 1;
    }
    catch (err) {
        console.error(`${err} 🔥🔥🔥🔥`);
        throw err;
    }
};
// loadSearchResults("pizza");

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        // newQt = oldQt + newServings / oldServings
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    });

    state.recipe.servings = newServings;
};

const persistBookmark = function () {
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
    // localStorage.removeItem("bookmark");
}

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmarked
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    persistBookmark();
};

export const deleteBookmark = function (id) {
    // Remove bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmark();
};

const init = function () {
    const storage = localStorage.getItem("bookmarks");
    if (storage) state.bookmarks = JSON.parse(storage);
};
init();
// console.log(state.bookmarks);

export const uploadRecipe = async function (newRecipe) {
    // console.log(Object.entries(newRecipe));
    try {
        const ingredients = Object.entries(newRecipe).filter(
            entry => entry[0].startsWith("ingredient") && entry[1] !== ""
        ).map(ing => {
            // const ingArr = ing[1].replaceAll(" ", "").split(",");
            const ingArr = ing[1].split(",").map(el => el.trim());

            if (ingArr.length != 3)
                throw new Error("Wrong ingredient format! Please use the correct format :)");

            const [quantity, unit, description] = ingArr;

            return { quantity: quantity ? +quantity : null, unit, description };
        });

        const recipe = {
            cooking_time: +newRecipe.cookingTime,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            servings: +newRecipe.servings,
            source_url: newRecipe.sourceUrl,
            title: newRecipe.title,
            ingredients,
            // id: newRecipe.id,
        }
        // const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe);
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        // console.log(data.data.recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    }
    catch (err) {
        throw err;
    }


};