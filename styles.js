const API_KEY = '75dcd968241395b503a4d7e76135cf71';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// Fetch trending movies and TV shows
async function fetchTrending(type) {
  try {
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching trending:", error);
    return [];
  }
}

// Fetch trending anime (from multiple pages for a wider selection)
async function fetchTrendingAnime() {
  try {
    let allResults = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
      const data = await res.json();
      const filtered = data.results.filter(item => item.original_language === 'ja' && item.genre_ids.includes(16));
      allResults = allResults.concat(filtered);
    }
    return allResults;
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    return [];
  }
}

// Display a banner for the featured item
function displayBanner(item) {
  const banner = document.getElementById('banner');
  const title = document.getElementById('banner-title');
  
  if (item && item.backdrop_path) {
    banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
    title.textContent = item.title || item.name;
  }
}

// Display list of items (movies, TV shows, or anime)
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous items

  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// Show detailed information in a modal
function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

// Change the video source based on selected server
function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  switch (server) {
    case "vidsrc.cc":
      embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
      break;
    case "vidsrc.me":
      embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
      break;
    case "player.videasy.net":
      embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
      break;
    default:
      embedURL = "";
  }

  document.getElementById('modal-video').src = embedURL;
}

// Close the modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = ''; // Reset video
}

// Open the search modal and focus on the input
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

// Close the search modal and clear results
function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

// Perform search and display results
async function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();
    const container = document.getElementById('search-results');
    container.innerHTML = '';

    data.results.forEach(item => {
      if (!item.poster_path) return;
      const
