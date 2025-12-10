const fs = require("fs");
const path = require("path");

function walkDir(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) return walkDir(full);
    if (dirent.isFile() && dirent.name.endsWith(".js")) return full;
    return [];
  });
}

const files = walkDir(__dirname).filter((f) => path.basename(f) !== "index.js");

const services = {};

files.forEach((file) => {
  const mod = require(file);
  if (mod && typeof mod === "object") {
    Object.assign(services, mod);
  } else {
    services[path.basename(file, ".js")] = mod;
  }
});

module.exports = services;
