import { isEscapeKey, openPopup, closePopup } from './util.js';
import { pictures, createErrorComment } from './thumbnails.js';
import { getData } from './api.js';

const LIMIT_OF_COMMENT = 5;

const body = document.querySelector('body');
const bigPicture = document.querySelector('.big-picture');
const popup = bigPicture.querySelector('.big-picture__preview');
const image = bigPicture.querySelector('.big-picture__img');
const likesCount = bigPicture.querySelector('.likes-count');
const overlay = document.querySelector('.overlay');
const imgUpload = document.querySelector('.img-upload');
const commentShownCount = bigPicture.querySelector('.social__comment-shown-count');
const commentTotalCount = bigPicture.querySelector('.social__comment-total-count');
const descriptionPhoto = bigPicture.querySelector('.social__caption');
const socialComments = bigPicture.querySelector('.social__comments');
const closeButton = bigPicture.querySelector('.big-picture__cancel');
const loadMoreButton = bigPicture.querySelector('.comments-loader');
const pictureDataFragment = document.createDocumentFragment();

const closeWindowOnKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    body.classList.remove('modal-open');
    bigPicture.classList.add('hidden');
  }
};

const createElement = (comment) => {
  const element = document.createElement('li');
  const newImage = document.createElement('img');
  const text = document.createElement('p');
  element.classList.add('social__comment');
  newImage.classList.add('social__picture');
  newImage.style.width = '35px';
  newImage.style.height = '35px';
  newImage.src = comment.avatar;
  newImage.alt = comment.name;
  element.append(newImage);
  text.classList.add('social__text');
  text.textContent = comment.message;
  element.append(text);
  pictureDataFragment.append(element);
};

const createComments = () => {
  let count = 0;
  return function (comments, index, limit) {
    for (let i = index; i < comments.length; i++) {
      createElement(comments[i]);
      count++;
      if (i >= limit) {
        break;
      }
    }
    commentShownCount.textContent = count;
    socialComments.append(pictureDataFragment);
    if (count === comments.length) {
      loadMoreButton.classList.add('hidden');
    }
  };
};

pictures.addEventListener('click', (evt) => {
  let index = 0;
  let limit = 4;
  const createElements = createComments();

  const getFullscreen = (photoData) => {
    photoData.forEach(({ id, url, likes, description, comments }) => {
      const loadButtonClick = () => {
        index += LIMIT_OF_COMMENT;
        limit += LIMIT_OF_COMMENT;
        createElements(comments, index, limit);
      };
      const closePicture = () => {
        closePopup(bigPicture, closeWindowOnKeydown);
        body.classList.remove('modal-open');
      };
      if (Number(evt.target.closest('.picture').dataset.id) === id) {
        image.children[0].src = url;
        likesCount.textContent = likes;
        descriptionPhoto.textContent = description;
        commentTotalCount.textContent = comments.length;
        body.classList.add('modal-open');
        socialComments.innerHTML = '';
        createElements(comments, index, limit);
        openPopup(bigPicture, closeWindowOnKeydown);
        if (comments.length > LIMIT_OF_COMMENT) {
          loadMoreButton.classList.remove('hidden');
          loadMoreButton.addEventListener('click', loadButtonClick);
        } else {
          loadMoreButton.classList.add('hidden');
          loadMoreButton.removeEventListener('click', loadButtonClick);
        }
      }
      closeButton.addEventListener('click', closePicture);
      document.addEventListener('keydown', closePicture);
      overlay.addEventListener('click', closePicture);
    });
  };
  getData(createErrorComment).then((data) => getFullscreen(data));
});

popup.addEventListener('click', (evt) => {
  evt.stopPropagation();
});

imgUpload.addEventListener('click', (evt) => {
  evt.stopPropagation();
});
