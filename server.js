const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

// servir fichiers HTML + JS
app.use(express.static(__dirname));

const JSON_DIR = path.join(__dirname, "json");

/* LIST FILES */
app.get("/files", (req, res) => {
  const files = fs.readdirSync(JSON_DIR);
  res.json(files.filter(f => f.endsWith(".json")));
});

/* LOAD FILE */
app.get("/file/:name", (req, res) => {
  const filePath = path.join(JSON_DIR, req.params.name);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "not found" });
  }

  const data = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(data));
});

/* SAVE FILE */
app.post("/save/:name", (req, res) => {
  const filePath = path.join(JSON_DIR, req.params.name);

  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));

  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("SERVER OK http://localhost:3000");
});