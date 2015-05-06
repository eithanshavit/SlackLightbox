// Setup
window.onload = function(){

  setupSearchBox()

}

function setupSearchBox() {

	var input = document.getElementById("search-box");

  // Erase search-box on touch
	if(input.addEventListener){
    input.addEventListener("click", function() {
			if (input.value == 'google some images'){
        input.value = '';
			}
		});
	}

  // Configure query updater
  var oldText=input.value;
  var timeout=null;

  // handleChange is called 300ms after the user stops typing
  function handleChange(){
    var newText=input.value;
    if (newText==oldText) return; else oldText=newText;
    alert(newText);
 }

  // eventHandler is called on keyboard and mouse events.
  // If there is a pending timeout, it cancels it.
  //  It sets a timeout to call handleChange in 50ms.
  function eventHandler(){
    if(timeout) clearTimeout(timeout);
    timeout=setTimeout(handleChange, 300);
  }

 input.onkeydown = input.onkeyup = input.onclick = eventHandler;

}
