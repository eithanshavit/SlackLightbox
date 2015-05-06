// Main setup
window.onload = function(){

  setupSearchBox()

}

// Setup the search box
function setupSearchBox() {

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
  function handleNewText(){
    var newText=input.value;
    if (newText==oldText) return; else oldText=newText;
    if (newText == "") return;
    alert(newText);
  }

  // Filter input events via timeout
  function windTimer(){
    if(timeout) clearTimeout(timeout);
    timeout = setTimeout(handleNewText, 300);
  }

  // Register events
  if (input.addEventListener) {
    input.addEventListener("click", handleTextClear);
    input.addEventListener("click", windTimer);
    input.addEventListener("keyup", windTimer);
    input.addEventListener("keydown", windTimer);
  }

}
