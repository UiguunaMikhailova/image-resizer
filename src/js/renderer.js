const form = document.querySelector("#form");
const input = document.querySelector("#img-input");
const filenameSpan = document.querySelector("#filename-span");
const filename = document.querySelector("#filename");

function loadImage(e) {
  const file = e.target.files[0];
  if (!file) {
    alert("Please select an image file");
    return;
  }
  form.classList.add("active");
  filename.classList.add("active");
  filenameSpan.innerHTML = file.name;
}

input.addEventListener("change", loadImage);