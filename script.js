const searchFormEl = document.querySelector("form");
const searchResultEl = document.querySelector(".search-result");
const containerEl = document.querySelector(".container");
const showMoreBtnEl = document.querySelector(".showMoreBtn");
const lightDarkEl = document.querySelector(".light-dark-mode");
const lightDarkIconEl = document.querySelector(".light-dark-mode > i");
const modal = document.querySelector(".modal");
const hidden = document.querySelector(".hidden");
const btnCloseModal = document.querySelector(".close-modal");
const overlay = document.querySelector(".overlay");
const btnsShowModal = document.querySelector(".show-modal");
const favMealContainer = document.querySelector(".fav-meals-container");
const mealTitle = document.querySelectorAll(".title");
let mealID;
let searchQuery = "";
let shownItems = 24;
const APP_ID = "1d4c0cd7";
const APP_KEY = "2aeba2861394b36fe4e04d9b22f28c31";

fetchFavMeals();

function openModal() {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
}

searchFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  searchQuery = e.target.querySelector("input").value;
  shownItems = 24;
  fetchAPI(searchQuery);
});
showMoreBtnEl.addEventListener("click", () => {
  shownItems += 24;
  fetchAPI(searchQuery);
});

async function fetchAPI() {
  const baseURL = `https://api.edamam.com/search?q=${searchQuery}&app_id=${APP_ID}&app_key=${APP_KEY}&to=${shownItems}`;
  const res = await fetch(baseURL);
  const data = await res.json();
  generateHTML(data.hits);
  console.log(data);
}

async function fetchMealByID(id) {
  const baseURL = `https://api.edamam.com/search?r=http%3A%2F%2Fwww.edamam.com%2Fontologies%2Fedamam.owl%23recipe_${id}&app_id=${APP_ID}&app_key=${APP_KEY}`;
  const res = await fetch(baseURL);
  const data = await res.json();
  const meal = data[0];
  return meal;
}

function generateHTML(results) {
  containerEl.classList.remove("initial");
  showMoreBtnEl.classList.remove("hidden");
  results.map((result) => {
    const meal_card = document.createElement("div");
    const mealTypeStr = `${result.recipe.mealType}`;
    let fullMealTypeStr = mealTypeStr
      .split("/")
      .map((word) => word[0].toUpperCase() + word.slice(1, word.length))
      .join("/");
    meal_card.classList.add("item");
    meal_card.innerHTML = `<img src="${result.recipe.image}" alt="" />
    <div class="flex-container">
      <h1 class="title">${result.recipe.label}</h1>
      <a class="viewBtn" href="${
        result.recipe.url
      }" target="_blank">View Recipe</a>
    </div>
    <p class="item-data">Calories: ${result.recipe.calories.toFixed(2)}</p>
    <p class="item-data">Diet Labels: ${
      result.recipe.dietLabels.length > 0
        ? result.recipe.dietLabels.join(", ").replaceAll("-", " ")
        : "No Data Found"
    }</p>
    <p class="item-data">Serving Size: ${result.recipe.yield}</p>
    <div class = "heart-containers">
    <p class="item-data">Meal Type: ${fullMealTypeStr}</p>
    <span class= "hearts"><i class="fa-regular fa-heart"></i></span>
    </div>`;

    const btn = meal_card.querySelector(".fa-heart");
    btn.addEventListener("click", () => {
      if (btn.classList.contains("fa-regular")) {
        btn.setAttribute("class", "fa-solid fa-heart");
        mealID = result.recipe.uri.slice(
          result.recipe.uri.lastIndexOf("_") + 1
        );
        addMealLS(mealID);
      } else {
        btn.setAttribute("class", "fa-regular fa-heart");
        mealID = result.recipe.uri.slice(
          result.recipe.uri.lastIndexOf("_") + 1
        );
        removeMealLS(mealID);
      }
      fetchFavMeals();
    });

    searchResultEl.appendChild(meal_card);
  });
}
function addMealLS(mealIDs) {
  const mealIds = getMealLS();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealIDs]));
}

function removeMealLS(mealIDs) {
  const mealIds = getMealLS();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealIDs))
  );
}
function getMealLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  favMealContainer.innerHTML = "";
  const mealsIds = getMealLS();
  const meals = [];
  for (let i = 0; i < mealsIds.length; i++) {
    const mealid = mealsIds[i];
    meal = await fetchMealByID(mealid);
    addMealToFav(meal);
    meals.push(meal);
  }
}

function addMealToFav(meal) {
  const fav_meals = document.createElement("div");
  fav_meals.innerHTML = `
        <div class="single">
          <div class="img-container">
            <img src="${meal.image}" alt="" />
          </div>
          <div class="text">
            <p>${meal.label}</p>
          </div>
          <i class="fa-solid fa-x"></i>
        </div>
   `;
  const x = fav_meals.querySelector(".fa-x");
  x.addEventListener("click", () => {
    mealID = meal.uri.slice(meal.uri.lastIndexOf("_") + 1);
    removeMealLS(mealID);
    const heartBtns = document.querySelectorAll(".fa-heart");
    heartBtns.forEach((heartBtn) => {
      heartBtn.setAttribute("class", "fa-regular fa-heart");
    });
    fetchFavMeals();
  });
  favMealContainer.appendChild(fav_meals);
}

lightDarkEl.addEventListener("click", () => {
  if (lightDarkIconEl.classList.contains("fa-sun")) {
    lightDarkIconEl.setAttribute("class", "fa-solid fa-moon");
  } else {
    lightDarkIconEl.setAttribute("class", "fa-solid fa-sun");
  }

  document.documentElement.classList.toggle("light-theme");
});

btnsShowModal.addEventListener("click", openModal);

btnCloseModal.addEventListener("click", closeModal);

overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});
