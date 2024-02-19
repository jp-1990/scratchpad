const fs = require("node:fs");

const headers = ["ID", "Title", "Description", "Status", "Source"];
const statuses = ["live", "pending", "rejected"];

function buildId() {
  return `${crypto.randomUUID()}`;
}

function buildTitle(index) {
  return `title-${index}`;
}

function buildDesc(index) {
  return `description-${index}`;
}

function buildStatus() {
  return statuses[Math.floor(Math.random() * 3)];
}

function main() {
  console.log("running data-gen...");
  console.log(__dirname);

  const MAX = 10;
  const SOURCES = ["file-0", "file-1", "file-2"];
  const files = [];

  for (let s = 0; s < SOURCES.length; s++) {
    let str = "";
    str = `${headers.join(",")}\n`;
    for (let i = 0; i < MAX; i++) {
      const newLine =
        `${buildId()},` +
        `${buildTitle(i)},` +
        `${buildDesc(i)},` +
        `${buildStatus()},` +
        `${SOURCES[s]}\n`;
      str += newLine;
    }
    files.push(str);
  }

  for (let i = 0; i < files.length; i++) {
    fs.writeFileSync(`${__dirname}/input/${SOURCES[i]}.csv`, files[i]);
  }
}

main();
