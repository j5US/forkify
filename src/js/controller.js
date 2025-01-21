import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

// import icons from "url:../img/icons.svg";
// import "core-js/stable";
import "regenerator-runtime/runtime";

// console.log(icons);

// if (module.hot) {
//   module.hot.accept();
// }


// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////


// const generateMarkup = function (recipe) {
//   return `<figure class="recipe__fig">
//        <img src="${recipe.image}" alt="${recipe.title}" class="recipe__img" />
//         <h1 class="recipe__title">
//          <span>${recipe.title}</span>
//        </h1>
//      </figure>

//      <div class="recipe__details">
//          <div class="recipe__info">
//            <svg class="recipe__info-icon">
//              <use href="${icons}#icon-clock"></use>
//            </svg>
//            <span class="recipe__info-data recipe__info-data--minutes">${recipe.cookingTime}</span>
//            <span class="recipe__info-text">minutes</span>
//          </div>
//          <div class="recipe__info">
//            <svg class="recipe__info-icon">
//              <use href="${icons}#icon-users"></use>
//            </svg>
//            <span class="recipe__info-data recipe__info-data--people">${recipe.servings}</span>
//            <span class="recipe__info-text">servings</span>

//            <div class="recipe__info-buttons">
//              <button class="btn--tiny btn--increase-servings">
//                <svg>
//                  <use href="${icons}#icon-minus-circle"></use>
//                </svg>
//              </button>
//              <button class="btn--tiny btn--increase-servings">
//                <svg>
//                  <use href="${icons}#icon-plus-circle"></use>
//                </svg>
//              </button>
//            </div>
//          </div>

//          <div class="recipe__user-generated">
//            <svg>
//              <use href="${icons}#icon-user"></use>
//            </svg>
//          </div>
//          <button class="btn--round">
//            <svg class="">
//              <use href="${icons}#icon-bookmark-fill"></use>
//            </svg>
//          </button>
//        </div>

//        <div class="recipe__ingredients">
//          <h2 class="heading--2">Recipe ingredients</h2>
//          <ul class="recipe__ingredient-list">
//          ${recipe.ingredients.map(ing => {
//     return `  <li class="recipe__ingredient">
//                           <svg class="recipe__icon">
//                               <use href="${icons}#icon-check"></use>
//                           </svg>
//                         <div class="recipe__quantity">${ing.quantity}</div>
//                       <div class="recipe__description">
//                         <span class="recipe__unit">${ing.unit}</span>
//                         ${ing.description}
//                       </div>
//                       </li>`;
//   }).join('')}

//         </ul>
//       </div>

//       <div class="recipe__directions">
//         <h2 class="heading--2">How to cook it</h2>
//         <p class="recipe__directions-text">
//           This recipe was carefully designed and tested by
//           <span class="recipe__publisher">${recipe.publisher}</span>. Please check out
//           directions at their website.
//         </p>
//         <a
//           class="btn--small recipe__btn"
//           href="${recipe.sourceUrl}"
//           target="_blank"
//         >
//           <span>Directions</span>
//           <svg class="search__icon">
//             <use href="${icons}#icon-arrow-right"></use>
//           </svg>
//         </a>
//       </div>`
// };

const controlRecipe = async function () {
  try {

    const id = window.location.hash.slice(1);
    // console.log(id);

    if (!id) return;

    // 0) Update results view
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1) Loading Recipe
    recipeView.renderSpinner();
    await model.loadRecipe(id);

    // console.log(model.state.recipe);
    // const { recipe } = model.state;
    // console.log(recipe);


    // 2) Rendering recipe

    recipeView.render(model.state.recipe);
    // const markup = generateMarkup(recipe)
    // recipeContainer.innerHTML = "";
    // recipeContainer.insertAdjacentHTML("afterbegin", markup);

  }
  catch (err) {
    // alert(err);
    recipeView.renderError()
  }
}
// controlRecipe();


const controlSearchResults = async function () {
  try {

    resultsView.renderSpinner();
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  }
  catch (err) {
    console.log(err);
  }
};
// controlSearchResults();

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  //Update the recipe view 
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {

  // 1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // console.log("🔥🔥🔥", model.state.recipe, model.state.bookmarks);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render the bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {

    // Show loading spinner
    addRecipeView.renderSpinner();


    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark View
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

  }
  catch (err) {
    // console.error("🔥", err);
    addRecipeView.renderError(err.message);
  }

};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);

};
init();

// const allEvents = [`hashchange`, `load`];
// allEvents.forEach(ev => window.addEventListener(ev, controlRecipe));


// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);




