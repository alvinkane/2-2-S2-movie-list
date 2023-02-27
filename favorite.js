// 當API作者更換版本時，只需更換一次
const BASE_URL = "https://webdev.alphacamp.io/";
// 因為需引用兩種API，所以再拆分
const index_URL = BASE_URL + "api/movies/";
const post_URL = BASE_URL + "posters/";

const movies = JSON.parse(localStorage.getItem("favoriteMovies"));

const dataPanel = document.querySelector("#data-panel");

const movieModelTitle = document.querySelector("#movie-modal-title");
const movieModelImg = document.querySelector("#movie-modal-image");
const movieModelDate = document.querySelector("#movie-modal-date");
const movieModelDes = document.querySelector("#movie-modal-description");

function renderMovieList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2 ms-2">
            <div class="card">
              <img
                src=${post_URL + item.image}
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-model"
                  data-id = ${item.id}
                >
                  More
                </button>
                <button class="btn btn-danger btn-delete-favorite" data-id = ${
                  item.id
                }>X</button>
              </div>
            </div>
          </div>
        </div>
        `;
  });

  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  axios.get(index_URL + id).then((response) => {
    const results = response.data.results;
    movieModelTitle.textContent = results.title;
    movieModelImg.innerHTML = `
    <img src="${post_URL + results.image}"alt="movie-poster"/>
    `;
    movieModelDate.textContent = `release date: ${results.release_date}`;
    movieModelDes.textContent = results.description;
  });
}

function deleteMovies(id) {
  // 如果收藏清單是空的，就結束這個函式。
  if (!movies || !movies.length) return;
  // const movie = movies.find((movie) => movie.id === id);
  // const removeindex = movies.indexOf(movie);

  //直接找index
  const removeindex = movies.findIndex((movie) => movie.id === id);
  // 一旦傳入的 id 在收藏清單中不存在，結束這個函式。
  if (removeindex === -1) return;
  movies.splice(removeindex, 1);
  localStorage.setItem("favoriteMovies", JSON.stringify(movies));
  renderMovieList(movies);
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target;
  if (target.matches(".btn-show-movie")) {
    showMovieModal(Number(target.dataset.id));
  } else if (target.matches(".btn-delete-favorite")) {
    deleteMovies(Number(target.dataset.id));
  }
});

renderMovieList(movies);
