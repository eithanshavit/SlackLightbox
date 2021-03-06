// (c) 2015 Eithan Shavit
// This code is licensed under MIT license

// Module begin
(function() {

////////////////////////////////////////////////
// State

var currentViewportZ = 0;
var currentImageModel;
var currentImageElement;
var displayedImageElement;
var currentImageIndex;
var searchBoxPlaceholderText;
var imageBuffer;

////////////////////////////////////////////////
// Setup

window.addEventListener('load', function() {
  setupSearch();
});

window.addEventListener('resize', function() {

  if (typeof currentImageModel !== 'undefined' && typeof currentImageElement !== 'undefined') {
    fitImage(currentImageModel.image, currentImageElement);
  }
});

window.addEventListener('keyup', function(event) {
  event = event || window.event;
  switch (event.keyCode) {
    case 37:
      keyboardLeftArrowPressed();
      break;
    case 39:
      keyboardRightArrowPressed();
      break;
  }
});

// Setup the search box
function setupSearch() {

  var input = document.getElementById('search-box');
  var oldText = input.value;
  searchBoxPlaceholderText = oldText;
  var timeout = null;

  // Erase search-box on touch
  function handleTextClear() {
    if (input.value == searchBoxPlaceholderText) {
      input.value = '';
    }
  }

  // Query Google when new text is here
  function handleTimer() {
    var newText = input.value;
    if (newText == oldText)
      return;
    else
      oldText = newText;
    if (newText === '') return;
    submitQuery(newText);
  }

  // Filter input events via timeout
  function windTimer() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(handleTimer, 400);
  }

  // Register events
  if (input.addEventListener) {
    input.addEventListener('click', handleTextClear);
    input.addEventListener('input', windTimer);
  }

}

////////////////////////////////////////////////
// Google Custom Search Engine

// Perform a search query
function submitQuery(query) {
  showLoader(true);
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        var results = JSON.parse(xmlhttp.responseText);
        handleSearchResults(results);
      } else if (xmlhttp.status == 403) {
        errorHandleQuotaLimit();
      } else {
        errorHandleAjaxError();
      }
    }
  };
  var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAMOt4sQ0pA8V4fUu33D0_KI9JeYxh6rJk&searchType=image&fileType=jpg&imgSize=large&cx=011144471896195526814:azuyictwjhk&q=' + encodeURIComponent(query);
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
}

// Handle valid response from Google API
function handleSearchResults(results) {
  // Hide loader
  showLoader(false);

  // Validate input
  if (typeof results === 'undefined' || !('items' in results)) {
    errorHandleNoImages();
    return;
  }

  // Filter for images only
  function filterByImageType(obj) {
    return ('image' in obj && typeof obj.image === 'object' && obj.mime === 'image/jpeg');
  }
  var images = results.items.filter(filterByImageType);
  var imagesCount = images.length;
  if (imagesCount < 1) {
    errorHandleNoImages();
    return;
  }

  imageBuffer = images;
  currentImageModel = images[0];
  setImageIndex(0);
  displayImage(currentImageModel);
  preloadImages(imageBuffer);
}

// Remove focus from search box
function blurSearchBox() {
  document.getElementById('search-box').blur();
}

////////////////////////////////////////////////
// Lightbox

// Set displayed image's index
function setImageIndex(index) {
  currentImageIndex = index;
  // Update counter
  document.getElementById('counter').innerHTML = (index + 1) + '/' + imageBuffer.length;
}

function preloadImages(images) {
  for (i = 0; i < images.length; i++) {
    img = new Image();
    img.src = images[i].link;
  }
}

// Stretch-fit image
function fitImage(imgModel, imgElem) {
  var destW = document.getElementById('lightbox').clientWidth;
  var destH = document.getElementById('lightbox').clientHeight;
  var destAspect = destW / destH;
  var srcW = imgModel.width;
  var srcH = imgModel.height;
  var srcAspect = srcW / srcH;

  if (srcAspect > destAspect) {
    // Src is wider
    imgElem.style.width = 'auto';
    imgElem.style.height = destH + 'px';
    imgElem.style.top = 0 + 'px';
    imgElem.style.left = (destW - destH * srcAspect) / 2 + 'px';
  }
  else {
    // Src is taller
    imgElem.style.width = destW + 'px';
    imgElem.style.height = 'auto';
    imgElem.style.top = (destH - destW / srcAspect) / 2 +
    'px';
    imgElem.style.left = 0 + 'px';
  }

}

// Fade loader in or out
function showLoader(show) {
  var loader = document.getElementById('status-loading');
  loader.style.opacity = show ? 1 : 0;
}

// Create new img element and push it to top of lightbox.
// Returns the newly created img element
function pushImageElement() {
  var elem = document.createElement('img');
  elem.className = 'viewport';
  elem.style.opacity = 0;
  // Sure, the next line will fail at 2,147,483,647 photos,
  // but if you're still looking at this slideshow by then,
  // you should get back to work.
  currentViewportZ += 1;
  elem.style.zIndex = currentViewportZ;
  document.getElementById('lightbox').appendChild(elem);
  return elem;
}

// Display image item
function displayImage(imageModel) {
  var elem = pushImageElement();
  currentImageElement = elem;
  fitImage(imageModel.image, elem);
  document.getElementById('title').innerHTML = imageModel.title;
  document.getElementById('title').style.color = '';
  var img = new Image();
  img.onerror = function(event) {
    errorHandleDownloadFail();
  };
  img.onload = function() {
    elem.src = imageModel.link;
    elem.style.opacity = 1;
    elem.addEventListener('transitionend', function() {
      displayedImageElement = elem;
      cleanupImageElements();
    });
  };
  img.src = imageModel.link;
}
// Remove old image elements

function cleanupImageElements() {
  removeDefaultContent();
  var imgElems = document.getElementsByClassName('viewport');
  for (var i = imgElems.length - 1; i >= 0; i--) {
    var elem = imgElems[i];
    if (elem.style.zIndex != currentViewportZ && elem != displayedImageElement) {
      elem.parentNode.removeChild(elem);
    }
  }
}

// Remove default content
function removeDefaultContent() {
  var lb = document.getElementById('lightbox');
  lb.style.backgroundColor = 'white';
  lb.style.background = 'none';
}

////////////////////////////////////////////////
// Keyboard events

function keyboardLeftArrowPressed() {
  if (typeof imageBuffer == 'undefined' || currentImageIndex <= 0) {
    return;
  }
  blurSearchBox();
  setImageIndex(currentImageIndex - 1);
  currentImageModel = imageBuffer[currentImageIndex];
  displayImage(currentImageModel);
}

function keyboardRightArrowPressed() {
  if (typeof imageBuffer == 'undefined' || currentImageIndex >= imageBuffer.length - 1) {
    return;
  }
  blurSearchBox();
  setImageIndex(currentImageIndex + 1);
  currentImageModel = imageBuffer[currentImageIndex];
  displayImage(currentImageModel);
}

////////////////////////////////////////////////
// Error Handling

// Error handling, images not found
function errorHandleNoImages() {
  document.getElementById('title').style.color = 'red';
  document.getElementById('title').innerHTML = 'COULDN\'T FIND ANY PHOTOS :(';
}

function errorHandleDownloadFail() {
  document.getElementById('title').style.color = 'red';
  document.getElementById('title').innerHTML = 'CANNOT GET PHOTO :(';
}

function errorHandleQuotaLimit() {
  alert('Google API quota reached');
}

// Error handling, AJAX error
function errorHandleAjaxError() {
  alert('Something went wrong. Please try again');
}

// Module end
}());
