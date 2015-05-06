// Main setup
window.onload = function(){
  setupSearch()
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
      console.log(images[i]);
      //Do something
  }

  document.getElementById("viewport-top").src = images[0].link;
}

// Error handling, images not found
function errorHandleNoImages() {
  alert("Couldn't find any images");
}

// Error handling, AJAX error
function errorHandleAjaxError() {
  alert("Something went wrong. Please try again");
}
