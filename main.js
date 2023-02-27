// 當API作者更換版本時，只需更換一次
const BASE_URL = "https://webdev.alphacamp.io/";
// 因為需引用兩種API，所以再拆分
const index_URL = BASE_URL + "api/movies/";
const post_URL = BASE_URL + "posters/";

const movies = [];
// 原本在函式內，但因為要使用分頁器，所以要拉出來
let filterMovies = [];

const dataPanel = document.querySelector("#data-panel");

const movieModelTitle = document.querySelector("#movie-modal-title");
const movieModelImg = document.querySelector("#movie-modal-image");
const movieModelDate = document.querySelector("#movie-modal-date");
const movieModelDes = document.querySelector("#movie-modal-description");

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

// 建立一參數一頁要顯示幾部電影
const MOVIES_PER_PAGE = 12;
const paginator = document.querySelector("#paginator");

// 切換顯示模式
let flag = 1;
const changeMode = document.querySelector("#change-mode");
// 把頁數拉出來，讓切換模式時，維持在同一頁
let page = 1;

// 切換模式是顯示當前模式，在icon加外框
const iconModes = document.querySelectorAll("i");

// 顯示電影
function renderMovieList(data, flag) {
  let rawHTML = "";
  const loveMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  let loveMovieHTML = "";
  if (flag === 1) {
    //卡片模式
    data.forEach((item) => {
      // 按下去後代表有收藏，所以會改變顏色更文字
      if (loveMovies.some((loveMovie) => loveMovie.id === item.id)) {
        loveMovieHTML = `<button type="button" class="btn btn-danger btn-add-favorite btn-secondary" data-id = ${item.id} data-bs-toggle="tooltip" data-bs-placement="top" title="Unlike"
                ><i class="fa-regular fa-heart" data-id = ${item.id}></i></button>`;
      } else {
        loveMovieHTML = `<button class="btn btn-info btn-add-favorite" data-id = ${item.id} data-bs-toggle="tooltip"  title="Like"
                >+</button>`;
      }
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
                ${loveMovieHTML}
              </div>
            </div>
          </div>
        </div>
        `;
    });
  } else if (flag === 0) {
    // 清單模式
    let containerHTML = "";

    data.forEach((item) => {
      if (loveMovies.some((loveMovie) => loveMovie.id === item.id)) {
        loveMovieHTML = `<button
                  class="btn btn-danger btn-add-favorite col-auto"
                  data-id=${item.id} data-bs-toggle="tooltip"  title="Unlike"
                >
                  <i class="fa-regular fa-heart" data-id = ${item.id}></i>
                </button>`;
      } else {
        loveMovieHTML = `<button
                  class="btn btn-info btn-add-favorite col-auto"
                  data-id=${item.id} data-bs-toggle="tooltip"  title="Like"
                >
                  +
                </button>`;
      }
      containerHTML += `
      
        <div
              class="col-12 mb-2 p-1 row align-self-center"
              style="border-bottom: solid 1px #f0f0f0"
            >
              <div class="col-md-6 align-self-center">${item.title}</div>
              <div class="row col-md-3 ms-auto justify-content-end">
                <button
                  class="btn btn-primary btn-show-movie col-auto me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-model"
                  data-id=${item.id}
                >
                  More
                </button>
                ${loveMovieHTML}
              </div>
            </div>
      `;
    });
    rawHTML = `
      <div class="container">
          <div class="row" style="border-top: solid 1px #f0f0f0">
            ${containerHTML}
          </div>
        </div>
    `;
  }
  dataPanel.innerHTML = rawHTML;
}

// 按more button所需要顯示的資料
function showMovieModal(id) {
  axios.get(index_URL + id).then((response) => {
    const results = response.data.results;
    movieModelTitle.textContent = results.title;
    movieModelImg.innerHTML = `
    <img src="${post_URL + results.image}" alt="movie-poster"/>
    `;
    movieModelDate.textContent = `release date: ${results.release_date}`;
    movieModelDes.textContent = results.description;
  });
}

// 將電影加入localstorage，用於favorite html
function addToFavorite(id) {
  // local storage不會隨著刷新頁面而消失，但是只接受字串
  // 透過JSON轉換字串跟物件格式
  // 如果有favoriteMovies則回傳它，如果沒有的話就回傳[]，因為||只要前面有true就先回傳那一個
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  // 找尋陣列中含id的項目
  const movie = movies.find((movie) => movie.id === id);

  // 如果已經有了，在按一次就刪掉
  if (list.some((listMovie) => listMovie.id === id)) {
    const movieIndex = list.findIndex((movie) => movie.id === id);
    list.splice(movieIndex, 1);
    console.log(list);
  } else {
    list.push(movie);
  }
  //設定要放入locaolstorage的陣列
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  // localStorage可以在google瀏覽器的開發者工具application看到或firefox的storage
}

// 設置一個函式需要顯示的movie
function getMoviesByPage(page) {
  // 需要區分是電影還是搜尋的電影
  // 如果沒有搜尋的話，filterMovies為空陣列，所以就代表顯示movies
  // 如果有搜尋的畫，有filterMovies，所以就代表顯示filterMovies
  const data = filterMovies.length ? filterMovies : movies;
  // 第一頁: 0-11、第二頁: 12-23
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;
  return data.slice(startIndex, endIndex);
}

// 設置分頁器的html
function renderPaginator(amount) {
  // 分頁器頁數 -> 總數(amount) / 12 = 80 / 12 = 6 ... 8 -> 7頁
  // 使用無條件進位ceil()
  let numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let i = 0; i < numberOfPages; i++) {
    const pageNumber = i + 1;

    if (page === pageNumber) {
      rawHTML += `<li class="page-item"><a class="page-link" style='background-color: #00CCFF' data-page=${pageNumber} href="#">${pageNumber}</a></li>`;
    } else {
      rawHTML += `<li class="page-item"><a class="page-link" data-page=${pageNumber} href="#">${pageNumber}</a></li>`;
    }
  }

  paginator.innerHTML = rawHTML;
  // 更改背景顏色
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target;
  if (target.matches(".btn-show-movie")) {
    showMovieModal(Number(target.dataset.id));
  } else if (
    target.matches(".btn-add-favorite") ||
    target.matches(".fa-heart")
    // 因有可能會按到愛心圖案，所以也需要納入，衍生出來的問題為該標籤也需要加入data-id
  ) {
    addToFavorite(Number(target.dataset.id));
    renderMovieList(getMoviesByPage(page), flag);
  }
});

// form有一個監聽指令(submit)
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  // submit動作預設會重整頁面，導致提交的表單內容被洗掉，所以需要有以下指令讓其不要有這個動作
  event.preventDefault();
  // trim() => 刪除前後空白
  // toLowerCase() => 將所有字母都轉成小寫，可以使得大小寫都可以
  const keyword = searchInput.value.trim().toLowerCase();
  // fiter用法，直接在陣列中找尋，回傳符合的value
  // includes用法
  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  // 迴圈做法
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filterMovies.push(movie);
  //   }
  // }

  if (filterMovies.length === 0) {
    searchInput.value = "";
    return alert("Don't have any movies contain " + keyword);
  }

  // 搜尋後的結果也要分頁
  renderPaginator(filterMovies.length);
  renderMovieList(getMoviesByPage(page), flag);

  searchInput.value = "";
});

// 設置分頁器的監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  const target = event.target;
  // 如果點擊的不是'a'的話，結束函式
  if (target.tagName !== "A") return;
  page = Number(target.dataset.page);
  renderMovieList(getMoviesByPage(page), flag);
  renderPaginator(movies.length);
});

//切換模式的監聽器
changeMode.addEventListener("click", function OnclickedMode(event) {
  const target = event.target;
  if (target.tagName !== "I") return;

  if (target.classList.contains("fa-th")) {
    // 卡片模式
    flag = 1;
    renderMovieList(getMoviesByPage(page), flag);
  } else if (target.classList.contains("fa-bars")) {
    // 清單模式
    flag = 0;
    renderMovieList(getMoviesByPage(page), flag);
  }
  // 在icon新增外框，代表為當前模式，其餘部分將外框取消
  if (target.dataset.id === "icon-mode") {
    iconModes.forEach((iconMode) => {
      if (target.classList === iconMode.classList) {
        target.classList.add("border", "border-primary", "border-2");
      } else {
        iconMode.classList.remove("border", "border-primary", "border-2");
      }
    });
  }
});

axios
  .get(index_URL)
  .then((response) => {
    const results = response.data.results;
    //   push的進階用法
    // 因為result為矩陣，如果不想要這層矩陣，除了for迴圈以外，還可以用以下作法
    movies.push(...results);
    renderPaginator(movies.length);
    // 一開始顯示第一頁
    renderMovieList(getMoviesByPage(page), flag);
  })
  .catch((err) => console.log(err));
