// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("load_command");


// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

document.getElementById("confirm").onclick = function() {
    modal.style.display = "none";
}

document.getElementById("cancel").onclick = function(event) {
    modal.style.display = "none";
}

document.getElementById("close").onclick = function(event) {
    modal.style.display = "none";
}
