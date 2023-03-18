const form = document.querySelector("#form");
const imgInput = document.querySelector("#img-input");
const filename = document.querySelector("#filename");
const outputPath = document.querySelector("#output-path");
const fileinfo = document.querySelectorAll(".fileinfo");
const widthInput = document.querySelector("#width");
const heightInput = document.querySelector("#height");

imgInput.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);

function loadImage(e) {
  const file = e.target.files[0];
  if (!file) {
    showToast("Please select an image file", "error");
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    widthInput.value = img.width;
    heightInput.value = img.height;
  };

  form.classList.add("active");
  fileinfo.forEach((item) => item.classList.add("active"));
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
}

function sendImage(e) {
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  if (!imgInput.files[0]) {
    showToast("Please upload an image", "error");
    return;
  }
  if (width === "" || height === "") {
    showToast("Please fill in a height and width", "error");
    return;
  }
  const imgPath = imgInput.files[0].path;
  // Send to main using ipcRenderer
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

// Catch image:done event
ipcRenderer.on("image:done", () => {
  showToast(
    `Image resized to ${widthInput.value} x ${heightInput.value}`,
    "success"
  );
});

function showToast(message, type) {
  const color = type === "success" ? "green" : "red";
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: color,
      color: "white",
      textAlign: "center",
    },
  });
}
