let chapterData = null;
let scenes = [];
let currentFile = "";

/* FETCH SAFE */
async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("Backend error:", e);
    alert("Server error");
    return null;
  }
}

/* LOAD FILE LIST */
async function loadFiles() {
  const files = await safeFetch("http://localhost:3000/files");
  if (!files) return;

  const list = document.getElementById("fileList");
  list.innerHTML = "";

  files.forEach(file => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = file;

    btn.onclick = () => loadFile(file);
    list.appendChild(btn);
  });
}

/* LOAD FILE */
async function loadFile(file) {
  currentFile = file;

  const json = await safeFetch("http://localhost:3000/file/" + file);
  if (!json) return;

  chapterData = json;
  scenes = Array.isArray(json.scenes) ? json.scenes : [];

  document.getElementById("title").textContent =
    `Chapter ${json.chapter ?? "?"} - ${json.title ?? ""}`;

  render();
}

/* RENDER */
function render() {
  const editor = document.getElementById("editor");
  editor.innerHTML = "";

  if (!scenes.length) {
    editor.innerHTML = "<p>No scenes</p>";
    return;
  }

  scenes.forEach((scene, i) => {
    editor.innerHTML += `
      <div class="card">
        <h3>${scene.id ?? "no-id"}</h3>

        <label>Speaker</label>
        <input value="${scene.speaker ?? ""}"
          oninput="scenes[${i}].speaker=this.value">

        <label>Text</label>
        <textarea oninput="scenes[${i}].text=this.value">${scene.text ?? ""}</textarea>

        <label>Background</label>
        <input value="${scene.background ?? ""}"
          oninput="scenes[${i}].background=this.value">

        <label>Music</label>
        <input value="${scene.music ?? ""}"
          oninput="scenes[${i}].music=this.value">
      </div>
    `;
  });
}

/* SAVE */
async function saveFile() {
  if (!currentFile || !chapterData) {
    alert("No file loaded");
    return;
  }

  const payload = {
    ...chapterData,
    scenes: scenes.map(s => ({
      id: s.id ?? "",
      speaker: s.speaker ?? null,
      text: s.text ?? "",
      background: s.background ?? null,
      music: s.music ?? null,
      choices: s.choices ?? []
    }))
  };

  const res = await safeFetch(
    "http://localhost:3000/save/" + currentFile,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  if (res?.ok) alert("Saved ✔");
  else alert("Save failed");
}

/* INIT */
window.onload = loadFiles;