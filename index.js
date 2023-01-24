// My API Key
const myKey = "9a59e84";
//Selector of Search Container
const searchContainer = document.querySelector("#searchContainer");

// Seletor of Search input
const searchInput = document.querySelector(".search-input");

// Selector of Page number
const pagination = document.querySelector(".pagination");
const displaySearchedText = document.querySelector(".searched-text-container");
const defaultContainer = document.querySelector(".default-container");

// Selector of Search Result
const searchResultContainer = document.querySelector(
  ".search-result-container"
);
//Selectors of Favourite Page

const favNotification = document.querySelector(".favNotification");
const navFavButton = document.querySelector(".navFavButton");
const deleteFavButton = document.querySelector("#deleteFav");
const favListContainer = document.querySelector("#list-container");
const favMsgContainer = document.querySelector(".favorite-msg-container");

// Array and Strings
let xhrRequest;
let favList = [];
let newFavList = [];
let newFavCount = 0;
let url = "";
let bodyID = "";
let pageNumber,
  totalPage,
  searchText,
  moviePageSearch,
  moviePageUrl,
  favPageNumber,
  favTotalPage,
  totalFavorites;

document.onload = (() => {
  // Display notification for unvisited fav list
  if (
    localStorage.newFavListCount &&
    Number(localStorage.newFavListCount) > 0
  ) {
    newFavCount = Number(localStorage.newFavListCount);
    favNotification.style.display = "block";
  } else {
    localStorage.newFavListCount = 0;
    favNotification.style.display = "none";
  }
  favNotification.innerHTML = `+${localStorage.newFavListCount}&nbsp`;
  // Checking the local storage for fav list
  const isPresent = localStorage.getItem("favList");
  const isNewFavListPresent = localStorage.getItem("newFavList");

  if (isNewFavListPresent) {
    newFavList = JSON.parse(isNewFavListPresent);
  }
  if (isPresent) {
    favList = JSON.parse(isPresent);
  }

  //Display diferent window for different page

  bodyID = window.document.body.id;
  if (bodyID == "movie-page" && searchInput.value.length < 3) {
    moviePageSearch = window.location.href.split("?")[1];
    requestingServer(moviePageSearch);
  }
  if (bodyID == "favorite-list-page" && searchInput.value.length < 3) {
    favPageNumber = 1;
    displayfavoriteList();
  }
  if (searchInput.value.length > 2) {
    searchText = searchInputtoString(searchInput.value);
    requestingServer(searchText);
  }
})();

// Add Event Listener Favourite Button
navFavButton.addEventListener("click", function () {
  localStorage.newFavListCount = 0;
  favNotification.style.display = "none";
  newFavList = [];
  localStorage.setItem("newFavList", JSON.stringify(newFavList));

  // Redirects to favourite page
  location.href = "./favourite.html";
});


function searchInputtoString(input) {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Add Event Listener to Keydown
searchInput.addEventListener("keydown", (event) => {
  if (
    searchInput.value.length < 3 ||
    (event.key === "Backspace" && searchInput.value.length < 3)
  ) {
    // Remove the search results from the page
    displayDefaultContainer();
  }
  if (event.key === "Enter") {
    if (searchInput.value.length > 2) {
      
      pageNumber = 1;
      searchText = searchInputtoString(searchInput.value);
      updateSearchResults(searchText);
    }
  }
});

// Add Event Listener to Input text
searchInput.addEventListener("input", (e) => {
  if (e.target.value.length < 3) {
    displayDefaultContainer();
  }
  if (e.target.value.length > 2) {
    
    pageNumber = 1;
    console.log("seacrchrd ", searchInputtoString(e.target.value));
    searchText = e.target.value;
    updateSearchResults(searchText);
  }
});

//Update search results

const updateSearchResults = (searchKeyword) => {
  requestingServer(searchKeyword);
};

function requestingServer(searchKeyword) {
  url = "";
  url = `https://www.omdbapi.com/?s=`;
  url = url + searchKeyword + `&plot=full&apikey=${myKey}&page=${pageNumber}`;
  if (bodyID == "movie-page" && searchInput.value.length < 3) {
    url = "";
    moviePageUrl = `https://www.omdbapi.com/?${moviePageSearch}&plot=full&apikey=${myKey}`;
    url = moviePageUrl;
  }
  // cheking if its aready been searched in current session
  let data;
  if (sessionStorage.getItem(url)) {
    // get the result from session storage and return without making any request to server
    if (bodyID == "movie-page" && searchInput.value.length < 3) {
      addMoviePageElements();
    } else {
      data = sessionStorage.getItem(url);
      addSearchElements();
    }

    return;
  }
  xhrRequest = new XMLHttpRequest();
  xhrRequest.onload = getSearchResult;
  xhrRequest.open("GET", url, true);
  xhrRequest.send();
  xhrRequest.onerror = function () {
    console.log("request.failed");
  };
}
//Getting the Search Movies
function getSearchResult() {
  // Save data to sessionStorage
  if (xhrRequest.status != "200") {
    console.log("error");
    return;
  }

  sessionStorage.setItem(url, xhrRequest.response);

  // Get saved data from sessionStorage

  if (bodyID == "movie-page" && searchInput.value.length < 3) {
    addMoviePageElements();
  } else {
    addSearchElements();
  }
}
//Display Search movies
function addSearchElements() {
  if (searchInput.value.length < 3) {
    displayDefaultContainer();
    return;
  }

  let data = sessionStorage.getItem(url);
  var responseJson = JSON.parse(data);

  displaySearchResultContainer();
  displaySearchedText.innerHTML = `<span class="searched-text" style="color:white" >Results for</span><span style="color:white">&nbsp:&nbsp</span><span class="search-result">${searchText}</span>`;
  // If no results are found
  if (responseJson.Response == "False") {
    searchContainer.innerHTML = `<div class="noResults text-center"><img src="./assets/images/noResults.png"></div>;<h1 class="text-center text-white">Sorry, We couldn't find any results</h1>`;
    pagination.innerHTML = "";
    return;
  }
  //Total Page of Results
  if (pageNumber == 1) {
    let totalResults = responseJson.totalResults;
    // We recieve 10 result per page
    totalPage = Math.ceil(totalResults / 10);
  }
  let searchList = responseJson.Search;
  searchContainer.innerHTML = "";
  searchList.forEach((element) => {
    let title = element.Title;
    let poster = element.Poster;
    // If no poster is available
    if (poster == "N/A" || poster == "n/a") {
      poster = "./assets/images/No_Image_Available.jpg";
    }
    let year = element.Year;
    let stype = element.Type;
    let imdbID = element.imdbID;
    let togggleClass = "";
    // checking if its already been added to fav or not
    let addedToFav = (() => {
      if (favList.some((row) => row.includes(imdbID))) {
        togggleClass = "added-to-fav";

        return "active";
      }
      return "inactive";
    })();

    // Show the searched movies through inner div

    displaySearchedText.innerHTML = `<span class="searched-text"  >Results for</span><span style="color:white">&nbsp:&nbsp</span><span class="search-result">${searchText}</span>`;

    searchContainer.innerHTML += ` <div class="card-container col-lg-3 col-md-4 col-sm-6 ">
                                <div class="card text-white mb-4 shadow-sm bg-dark ">
                                    <div>
                                        <a href="./movie-page.html?i=${imdbID}">
                                    <img class="card-img-top"  alt="Thumbnail [100%x225] " style="height: 350px; width: 100%; display: block; " src="${poster}
                        " onerror="this.onerror=null; this.src='./assets/images/No_Image_Available.jpg'" data-holder-rendered="true"></a>
                        <div class="like-container d-flex justify-content-end position-absolute end-0 top-0 mx-1 my-1"><div class="like d-flex justify-content-end position-absolute end-0 top-0 mx-1 my-1 ${togggleClass}"  data-list-active="${addedToFav}" style="">
            
                                        
                                          <i class="fas fa-heart " onclick="event,addToFav('${encodeURIComponent(
                                            JSON.stringify(element)
                                          )}')"></i>
                                        </div>
                                        
                                      </div>
                                </div>
                                    <div class="card-body ">
                                    <a href="./movie-page.html?i=${imdbID}">
                                        <h5 class="card-title searchTitle" data-search-result-title>${title}</h5></a>
                                        <h6 class="card-subtitle mb-2 text-muted ">${year}</h6>
                                      
                                    </div>
                                </div>
                            </div>`;
  });
  // Adding pagination
  addPagination();
}

// Add to Favourite List

function addToFav(encodedObj) {
  let favIconContainer = event.target.parentElement;
  event.preventDefault();
  obj = JSON.parse(decodeURIComponent(encodedObj));
  let imdbID = obj.imdbID;
  let isAdded = favIconContainer.getAttribute("data-list-active");
  if (isAdded == "inactive") {
    localStorage.newFavListCount = Number(localStorage.newFavListCount) + 1;
    favIconContainer.classList.toggle("added-to-fav");
    favIconContainer.setAttribute("data-list-active", "active");
    favList.push([imdbID, obj]);
    localStorage.setItem("favList", JSON.stringify(favList));
    newFavList.push(imdbID);
    localStorage.setItem("newFavList", JSON.stringify(newFavList));
  } else {
    // don't decrease the count beyond 0
    if (localStorage.newFavListCount > 0) {
      for (let i = 0; i < newFavList.length; i++) {
        if (newFavList[i].includes(imdbID)) {
          newFavList.splice(i, 1);
          localStorage.newFavListCount =
            Number(localStorage.newFavListCount) - 1;
          localStorage.setItem("newFavList", JSON.stringify(newFavList));
          break;
        }
      }
    }

    // Delete from the list of Favourite Movies
    for (let i = 0; i < favList.length; i++) {
      if (favList[i].includes(imdbID)) {
        console.log("yes");
        favList.splice(i, 1);
        break;
      }
    }
    localStorage.setItem("favList", JSON.stringify(favList));
    favIconContainer.classList.toggle("added-to-fav");
    favIconContainer.setAttribute("data-list-active", "inactive");
  }
  //
  if (Number(localStorage.newFavListCount) > 0) {
    favNotification.style.display = "block";
  }
  if (Number(localStorage.newFavListCount) == 0) {
    favNotification.style.display = "none";
  }
  favNotification.innerHTML = `+${localStorage.newFavListCount}&nbsp`;
}

function addPagination() {
  console.log("pagination", totalPage);
  pagination.innerHTML = "";
  if (totalPage > 1) {
    if (pageNumber == 1) {
      pagination.innerHTML = ` <li class="current ">
            <div class="page-number active-page">${pageNumber}</div>
        </li>
        <li class="current ">
        <div class="page-number dots"><i class="fa-solid fa-circle"></i>&nbsp<i class="fa-solid fa-circle"></i></div>
    </li>
        <li class="last ">
            <div class="page-number " onClick="changePage(${totalPage})">${totalPage}</li>   
        <li calss="next ">
            <div class="page-number" onClick="changePage(${
              pageNumber + 1
            })"><i class="fa-solid fa-angle-right "></i></div>
        </li>`;
    } else if (pageNumber == totalPage) {
      pagination.innerHTML = ` 
            <li class="prev">
                        <div class="page-number" onClick="changePage(${
                          pageNumber - 1
                        })"><i class="fa-solid fa-angle-left"></i></div>
                    </li>
                    <li class="first">
                        <div class="page-number " onClick="changePage(1)">1</div>
                    </li>
                    <li class="current ">
                    <div class="page-number dots"><i class="fa-solid fa-circle"></i>&nbsp<i class="fa-solid fa-circle"></i></div>
                </li>
            <li class="current ">
            <div class="page-number active-page">${pageNumber}</div>
        </li>`;
    } else {
      pagination.innerHTML = ` 
            <li class="prev">
                        <div class="page-number" onClick="changePage(${
                          pageNumber - 1
                        })"><i class="fa-solid fa-angle-left"></i></div>
                    </li>
                    <li class="first">
                        <div class="page-number " onClick="changePage(1)">1</div>
                    </li>
                    <li class="current ">
                    <div class="page-number dots"><i class="fa-solid fa-circle"></i>&nbsp<i class="fa-solid fa-circle"></i></div>
                </li>
            <li class="current ">
            <div class="page-number active-page">${pageNumber}</div>
        </li>
        <li class="current ">
            <div class="page-number dots"><i class="fa-solid fa-circle"></i>&nbsp<i class="fa-solid fa-circle"></i></div>
        </li>
        <li class="last ">
            <div class="page-number " onClick="changePage(${totalPage})">${totalPage}</li>
           
        <li calss="next ">
            <div class="page-number" onClick="changePage(${
              pageNumber + 1
            })"><i class="fa-solid fa-angle-right "></i></div>
        </li>`;
    }
  }
}

//Change Page Number
function changePage(value) {
  pageNumber = value;
  requestingServer(searchText);
  window.scrollTo(0, 0);
}

//Add Movie Page
function addMoviePageElements() {
  let data = sessionStorage.getItem(moviePageUrl);
  var responseJson = JSON.parse(data);
  if (responseJson.Response == "False") {
    return;
  }
  displayDefaultContainer();

  let movie = responseJson;
  console.log(movie);
  let movieTitle = movie.Title;
  let movieYear = movie.Year;
  let movieRated = movie.Rated;
  let movieRuntime = movie.Runtime;
  let movieReleased = movie.Released;
  let movieGenre = movie.Genre;
  let movieDirector = movie.Director;
  let movieWriter = movie.Writer;
  let moviePlot = movie.Plot;
  let moveActors = movie.Actors;
  let moviePoster = movie.Poster;
  let movieimdbRating = movie.imdbRating;
  let movieType = movie.Type;
  let extra;
  let extraValue;
  if (movieType == "series") {
    extra = "Seasons";
    extraValue = movie.totalSeasons;
  }
  if (movieType == "movie") {
    extra = "Box BoxOffice";
    extraValue = movie.BoxOffice;
  }
  let movieCountry = movie.Country;
  if (moviePoster == "N/A" || moviePoster == "n/a") {
    moviePoster = "./assets/images/No_Image_Available.jpg";
  }
  let imdbID = movie.imdbID;
  let togggleClass = "";
  // checking if its already added to fav or not
  let addedToFav = (() => {
    if (favList.some((row) => row.includes(imdbID))) {
      togggleClass = "added-to-fav";
      return "active";
    }
    return "inactive";
  })();

  // Selector for Movie Details
  const movieDetails = document.querySelector("#movie-details-container");
  movieDetails.innerHTML = "";

  //Dislpaying the Movie Details through inner div
  movieDetails.innerHTML = `
    <div class="row g-0 movie-details-container">
    <div class="col-md-4" id="movie-poster">
       
    <img src="${moviePoster} class="img-fluid  mx-auto d-block rounded-start" alt="...">
    <div class="like-container d-flex justify-content-end position-absolute end-0 top-0 mx-1 my-1"><div class="like d-flex justify-content-end position-absolute end-0 top-0 mx-1 my-1 ${togggleClass}"  data-list-active="${addedToFav}" style="">
                                          <i class="fas fa-heart" onclick="event,moviePageAddToFav()"></i>
                                        </div>
                                      </div>
    </div>
    <div class="col-md-8 px-2" id="movie-subDetails-container">
        <div class="card-body">
            <h2 class="card-title">${movieTitle}</h2>
            <div class="text-muted card-subtitle" id="movie-subdetails">
                <span id="age-group"><i class="fa-solid fa-user"></i>&nbsp ${movieRated}</span>
                <span id="runtime"><i class="fa-solid fa-clock"></i>&nbsp ${movieRuntime}</span>
                <span id="released-year"><i class="fa-solid fa-calendar-days"></i>&nbsp ${movieYear}</span>
                <span id="country"><i class="fa-solid fa-globe"></i></i>&nbsp ${movieCountry}</span>
                <span>
                    <span id="imdb-rating"><i class="fa-solid fa-star"></i></i></span><span>&nbsp${movieimdbRating}</span>
                </span>
            </div>
            <p class="card-text details" id="movie-plot">${moviePlot}
            </p>
            <div class="genre"><span class="extra-details-title genre-title">Genre</span><span class="extra-details-value genre-value">&nbsp&nbsp ${movieGenre}</span></div>
            <div class="type"><span class="extra-details-title type-title">Type</span><span class="extra-details-value genre-value">&nbsp&nbsp ${movieType}</span></div>
            <div class="generaic"><span class="extra-details-title genre-title">${extra}</span><span class="extra-details-value genre-value">&nbsp&nbsp ${extraValue}</span></div>
            <div class="director"><span class="extra-details-title director-title">Director</span><span class="extra-details-value genre-value">&nbsp&nbsp ${movieDirector}</span></div>
            <div class="writer"><span class="extra-details-title writer-title">Writers</span><span class="extra-details-value writer-value">&nbsp&nbsp ${movieWriter}</span></div>
            <div class="actor"><span class="extra-details-title actor-title">Actors</span><span class="extra-details-value actor-value">&nbsp&nbsp${moveActors}</span></div>
        </div>
    </div>
</div>`;
}

//MOvie added to favourite through movie page
function moviePageAddToFav() {
  let favIconContainer = event.target.parentElement;
  event.preventDefault();
  obj = JSON.parse(sessionStorage.getItem(moviePageUrl));
  let imdbID = obj.imdbID;
  let isAdded = favIconContainer.getAttribute("data-list-active");

  if (isAdded == "inactive") {
    localStorage.newFavListCount = Number(localStorage.newFavListCount) + 1;

    favIconContainer.classList.toggle("added-to-fav");
    favIconContainer.setAttribute("data-list-active", "active");
    newFavList.push(imdbID);
    localStorage.setItem("newFavList", JSON.stringify(newFavList));
    favList.push([imdbID, obj]);
    localStorage.setItem("favList", JSON.stringify(favList));
  } else {
    if (localStorage.newFavListCount > 0) {
      for (let i = 0; i < newFavList.length; i++) {
        if (newFavList[i].includes(imdbID)) {
          newFavList.splice(i, 1);
          localStorage.newFavListCount =
            Number(localStorage.newFavListCount) - 1;
          localStorage.setItem("newFavList", JSON.stringify(newFavList));
          break;
        }
      }
    }
    // Delete from the list of Favorites Movies
    for (let i = 0; i < favList.length; i++) {
      if (favList[i].includes(imdbID)) {
        console.log("yes");
        favList.splice(i, 1);
        break;
      }
    }
    localStorage.setItem("favList", JSON.stringify(favList));
    favIconContainer.classList.toggle("added-to-fav");
    favIconContainer.setAttribute("data-list-active", "inactive");
  }
  if (Number(localStorage.newFavListCount) > 0) {
    favNotification.style.display = "block";
  }
  if (Number(localStorage.newFavListCount) == 0) {
    favNotification.style.display = "none";
  }
  favNotification.innerHTML = `+${localStorage.newFavListCount}&nbsp`;
}

// Favorite list page

function displayfavoriteList() {
  displayDefaultContainer();

  let list = [];
  console.log("hey fav list is " + favList);
  favList.forEach((element) => {
    list.push(element[1]);
  });
  totalFavorites = list.length;
  console.log("list", list.length);
  //Total number of favourites movies through inner div
  favMsgContainer.innerHTML = `<span class="searched-text">Total Favorites</span><span style="color:white">&nbsp:&nbsp</span><span class="search-result">${totalFavorites}</span>`;

  favListContainer.innerHTML = "";
  // in decending order i.e., newest to oldest
  list
    .slice()
    .reverse()
    .forEach((element) => {
      let title = element.Title;
      let poster = element.Poster;
      // if no poster is available
      if (poster == "N/A" || poster == "n/a") {
        poster = "./assets/images/No_Image_Available.jpg";
      }
      let year = element.Year;
      let stype = element.Type;
      let imdbID = element.imdbID;
      let togggleClass = "";
      // checking if its already added to fav or not
      let addedToFav = (() => {
        if (favList.some((row) => row.includes(imdbID))) {
          togggleClass = "added-to-fav";

          return "active";
        }
        return "inactive";
      })();
      //Displaying the Favourite Movies through inne div
      favListContainer.innerHTML += ` <div class="card-container col-lg-3 col-md-4 col-sm-6 ">
                                <div class="card text-white mb-4 shadow-sm bg-dark ">
                                    <div>
                                        <a href="./movie-page.html?i=${imdbID}">
                                    <img class="card-img-top"  alt="Thumbnail [100%x225] " style="height: 350px; width: 100%; display: block; " src="${poster}
                        " onerror="this.onerror=null; this.src='./assets/images/No_Image_Available.jpg'" data-holder-rendered="true "></a>
                                    <div class="like-container d-flex justify-content-end position-absolute end-0 top-0 mx-1 my-1"><div class="like d-flex justify-content-end position-absolute end-0 top-0 mx-1 my-1"  id="deleteFav" style="">
                                    <i class="fas fa-trash-alt icon trash-icon" onclick="event,deleteFromFavPage('${imdbID}')"></i>
                                        </div>
                                      </div>
                                </div>
                                    <div class="card-body ">
                                    <a href="./movie-page.html?i=${imdbID}">
                                        <h5 class="card-title searchTitle" data-search-result-title>${title}</h5></a>
                                        <h6 class="card-subtitle mb-2 text-muted ">${year}</h6>
                                        
                                    </div>
                                </div>
                            </div>`;
    });
}

//Delete Movie From Favourite Page
function deleteFromFavPage(imdbID) {
  let removedElement =
    event.target.parentElement.parentElement.parentElement.parentElement
      .parentElement;
  for (let i = 0; i < favList.length; i++) {
    if (favList[i].includes(imdbID)) {
      console.log("yes");
      favList.splice(i, 1);
      break;
    }
  }
  localStorage.setItem("favList", JSON.stringify(favList));
  removedElement.remove();
  totalFavorites = totalFavorites - 1;
  favMsgContainer.innerHTML = `<span class="searched-text">Total Favorites</span><span style="color:white">&nbsp:&nbsp</span><span class="search-result">${totalFavorites}</span>`;
}

function displayDefaultContainer() {
  searchResultContainer.style.display = "none";
  defaultContainer.style.display = "block";
  // when we are adding element in favourite page.we don't need to display new notification
  if (bodyID == "favorite-list-page") {
    localStorage.newFavListCount = 0;
    favNotification.style.display = "none";
  }
}

function displaySearchResultContainer() {
  defaultContainer.style.display = "none";
  searchResultContainer.style.display = "block";
}