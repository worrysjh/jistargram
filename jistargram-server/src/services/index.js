const fs = require("fs");
const path = require("path");

const files = fs
  .readdirSync(__dirname)
  .filter((f) => f !== "index.js" && f.endsWith(".js"));

const services = {};

files.forEach((file) => {
  const mod = require(path.join(__dirname, file));
  if (mod && typeof mod === "object") {
    Object.assign(services, mod);
  } else {
    services[path.basename(file, ".js")] = mod;
  }
});

module.exports = services;
