////////////////////////////////////////////////
// State

var currentViewportZ;
var currentImageModel;
var currentImageElement;

////////////////////////////////////////////////
// Setup

window.onload = function() {
  setupSearch();
  setupLightbox();
}

window.onresize = function() {
  fitImage(currentImageModel, currentImageElement);
}

// Setup the lightbox
function setupLightbox() {
  // Register viewport's zindex
  var viewport = document.getElementsByClassName("viewport")[0];
  currentViewportZ = parseInt(viewport.style.zIndex);
}

// Setup the search box
function setupSearch() {

  var input = document.getElementById("search-box");
  var oldText=input.value;
  var timeout=null;

  // Erase search-box on touch
  function handleTextClear() {
    if (input.value == 'google some images'){
      input.value = '';
    }
  }

  // Query Google when new text is here
  function handleTimer(){
    var newText=input.value;
    if (newText==oldText) return; else oldText=newText;
    if (newText == "") return;
    submitQuery(newText);
  }

  // Filter input events via timeout
  function windTimer(){
    if(timeout) clearTimeout(timeout);
    timeout = setTimeout(handleTimer, 300);
  }

  // Register events
  if (input.addEventListener) {
    input.addEventListener("click", handleTextClear);
    input.addEventListener("click", windTimer);
    input.addEventListener("keyup", windTimer);
    input.addEventListener("keydown", windTimer);
  }

}

// Perform a search query
function submitQuery(query) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4) {
      if (xmlhttp.status==200) {
        var results = JSON.parse(xmlhttp.responseText);
        handleSearchResults(results);
      } else if (xmlhttp.status==403) {
        errorHandleQuotaLimit();
        return;
      } else {
        errorHandleAjaxError();
        return;
      }
    }
  }
  var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAMOt4sQ0pA8V4fUu33D0_KI9JeYxh6rJk&searchType=image&fileType=jpg&imgSize=large&cx=011144471896195526814:azuyictwjhk&q=" + query;
  xmlhttp.open("GET",url, true);
  xmlhttp.send();
}

// Handle valid response from Google API
function handleSearchResults(results) {
  // Validate input
  if (typeof(results) === "undefined" || !("items" in results)) {
    errorHandleNoImages();
    return;
  }

  // Filter for images only
  function filterByImageType(obj) {
    return ('image' in obj && typeof(obj.image) === 'object')
  }
  var images = results.items.filter(filterByImageType);
  var imagesCount = images.length;
  if (imagesCount < 1) {
    errorHandleNoImages();
    return;
  }

  //
  for (var i = 0; i < imagesCount; i++) {
    //Do something
  }

  var item = images[0];
  displayImage(item);
}

////////////////////////////////////////////////
// Lightbox image functionality

// Stretch-fit image
function fitImage(imgModel, imgElem) {
  var destW = document.getElementById('lightbox').clientWidth;
  var destH = document.getElementById('lightbox').clientHeight;
  var destAspect = destW/destH;
  var srcW = imgModel.width;
  var srcH = imgModel.height;
  var srcAspect = srcW/srcH;

  if (srcAspect > destAspect) {
    // Src is wider
    imgElem.style.width = 'auto';
    imgElem.style.height = destH;
    imgElem.style.top = 0;
    imgElem.style.left = (destW - destH * srcAspect) / 2;
  }
  else {
    // Src is taller
    imgElem.style.width = destW;
    imgElem.style.height = 'auto';
    imgElem.style.top = (destH - destW / srcAspect) / 2;
    imgElem.style.left = 0;
  }

}

function cleanupImageElements() {
  var imgElems = document.getElementsByClassName("viewport");
  for(var i = imgElems.length -1; i >= 0 ; i--) {
    if(imgElems[i].style.zIndex != currentViewportZ) {
      var imgElem = imgElems[i];
      imgElem.parentNode.removeChild(imgElem);
    }
  }
}

// Create new img element and push it to top of lightbox.
// Returns the newly created img element
function pushImageElement() {
  var elem = document.createElement("img");
  elem.className = "viewport";
  elem.style.visibility = "hidden";
  elem.style.opacity = 0;
  // Sure, the next line will fail at 2,147,483,647 photos,
  // but if you're still looking at this slideshow by then,
  // you should get back to work.
  currentViewportZ += 1;
  elem.style.zIndex = currentViewportZ;
  document.getElementById("lightbox").appendChild(elem);
  return elem;
}

// Display image item
function displayImage(imageModel) {
  var elem = pushImageElement();
  currentImageElement = elem;
  currentImageModel = imageModel;
  fitImage(imageModel.image, elem);
  var img = new Image();
  img.onload = function() {
    elem.src = imageModel.link;
    elem.style.visibility = "visible";
    elem.style.opacity = 1;
    elem.addEventListener("transitionend", cleanupImageElements, true);
  }
  img.src = imageModel.link;
}

////////////////////////////////////////////////
// Error Handling

// Error handling, images not found
function errorHandleNoImages() {
  alert("Couldn't find any images");
}

function errorHandleQuotaLimit() {
  alert("Google API quota reached");
}

// Error handling, AJAX error
function errorHandleAjaxError() {
  alert("Something went wrong. Please try again");
}
