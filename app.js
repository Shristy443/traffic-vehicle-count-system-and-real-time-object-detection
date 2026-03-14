
const uploadBox = document.querySelector(".upload-box");
const uploadBtn = document.querySelector(".card .btn");
const resultImg = document.querySelector(".placeholder");
const list = document.querySelector(".info ul");
// const cameraBtn = document.querySelectorAll(".btn")[1];
const cameraBtn = document.querySelectorAll(".btn")[1];
cameraBtn.classList.remove("disabled");

let selectedFile = null;

// drag / select
uploadBox.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file"; 
  input.accept = "image/*";
  input.onchange = e => {
    selectedFile = e.target.files[0];
    uploadBtn.classList.remove("disabled");
    uploadBox.textContent = selectedFile.name;
  };
  input.click();
});

// upload + detect
uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const form = new FormData();
  form.append("image", selectedFile);

  const res = await fetch("http://localhost:5000/detect", {
    method: "POST",
    body: form
  });

  const data = await res.json();

  if (!data.success) return alert("Detection failed");

  resultImg.innerHTML =
    `<img src="http://localhost:5000${data.image}" width="100%">`;

  list.innerHTML = `
    <li>Total: ${data.total}</li>
    ${Object.entries(data.classes)
      .map(([k, v]) => `<li>${k}: ${v}</li>`)
      .join("")}
  `;
});

// camera
cameraBtn.addEventListener("click", async () => {
  await fetch("http://localhost:5000/camera");
  alert("Camera window should open — press Q to quit");
});