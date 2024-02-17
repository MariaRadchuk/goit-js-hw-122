
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('.form');
const searchInput = document.querySelector('.input-name');
const loader = document.querySelector('.loader');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-btn');
let totalHits = 0;
let page = 1;

const api = axios.create({
  baseURL: 'https://pixabay.com/api/',
  params: {
    key: '42310325-d8e2b88bd4f4d7db9639050a5',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 15,
  },
});

const galleryLightbox = new SimpleLightbox('.image-link', {
  captionsData: 'alt',
  captionDelay: 250,
});

async function getPhoto(event) {
  event.preventDefault();

  const searchQuery = searchInput.value.trim();

  if (!searchQuery) {
    showErrorToast('Please enter a search query');
    return;
  }

  try {
    loader.classList.add('visible');
    const response = await api.get('', { params: { q: searchQuery } });
    const data = response.data;
    totalHits = data.totalHits;
    renderPhotos(data.hits);
  } catch (error) {
    console.error('Error fetching data:', error);
    showErrorToast('Error fetching data. Please try again later.');
  } finally {
    loader.classList.remove('visible');
  }
}

function renderPhotos(photos) {
  if (photos.length === 0) {
    showErrorToast('Sorry, there are no images matching your search query. Please try again!');
    return;
  }

  gallery.innerHTML = photos.map(makeMarkup).join('');
  galleryLightbox.refresh();
  showLoadBtn();
}

function makeMarkup(photo) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = photo;

  return `
    <li class="photo">
      <div class="photo-card">
        <a class="image-link" data-lightbox="image" href="${largeImageURL}">
          <img class="gallery-image" data-source="${largeImageURL}" src="${webformatURL}" alt="${tags}">
        </a>
      </div>
      <div class="description">
        <p class="description-item"> Likes ${likes}</p>
        <p class="description-item"> Views ${views}</p>
        <p class="description-item"> Comments ${comments}</p>
        <p class="description-item"> Downloads ${downloads}</p>
      </div>
    </li>`;
}

async function onLoadMoreClick() {
  try {
    loader.classList.add('visible');
    const response = await api.get('', { params: { q: searchInput.value.trim(), page: ++page } });
    renderPhotos(response.data.hits);
    smoothScrollToNextGallery();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loader.classList.remove('visible');
  }
  
  isLoadMore();
}

function showErrorToast(message) {
  iziToast.error({
    title: 'Error',
    message: message,
    backgroundColor: 'red',
    messageColor: 'white',
    messageSize: '25',
  });
}

function smoothScrollToNextGallery() {
  const galleryItemHeight = document.querySelector('.photo').getBoundingClientRect().height;
  window.scrollBy({ top: galleryItemHeight * 2, behavior: 'smooth' });
}

function showLoadBtn() {
  loadBtn.style.visibility = 'visible';
}

function hideLoadBtn() {
  loadBtn.style.visibility = 'hidden';
}

function isLoadMore() {
  if (totalHits <= page * 15) {
    hideLoadBtn();
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      backgroundColor: '#125487',
      messageColor: 'white',
      messageSize: '25',
    });
  }
}

form.addEventListener('submit', getPhoto);
loadBtn.addEventListener('click', onLoadMoreClick);

