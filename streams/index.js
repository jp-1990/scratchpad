const csv = require("csv-parser");
const fs = require("node:fs");
const stream = require("node:stream");
const { pipeline } = require("stream/promises");
const readline = require("node:readline");

function getFileReadStream(path) {
  return fs.createReadStream(`${__dirname}/${path}`, { encoding: "utf8" });
}

class MultiReadable extends stream.Readable {
  constructor(filePaths) {
    super();
    this.filePaths = filePaths;
    this.total = filePaths.length;
    this.headers = ["ID", "Title", "Description", "Status", "Source"];
    this.headerRegex = new RegExp(`(${this.headers.join("|")})`);
  }
  _read(_size) {
    if (!this.filePaths.length) {
      this.push(null);
      return;
    }

    const path = this.filePaths.shift();
    const stream = getFileReadStream(path);
    const reader = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    reader.on("line", (data) => {
      if (
        this.filePaths.length !== this.total &&
        data.match(this.headerRegex)
      ) {
        return;
      }
      this.push(`${this.headers.join(",")}\n${data}`);
    });
  }
}

const fromCSV = csv();

const testStream = new stream.Transform({
  objectMode: true,
  transform(chunk, _encoding, callback) {
    console.log("TEST:", chunk.toString());
    callback(null, chunk);
  },
});

let first = true;
const toJSON = new stream.Transform({
  objectMode: true,
  transform(chunk, _encoding, callback) {
    let entry = JSON.stringify(chunk);
    if (first) {
      entry = "[" + entry;
      first = false;
    } else {
      entry = "," + entry;
    }
    entry += "\n";
    callback(null, entry);
  },
  flush(callback) {
    callback(null, "]");
  },
});

function getWriteStream(path) {
  return fs.createWriteStream(`${__dirname}/${path}`, { encoding: "utf8" });
}

async function fanPipelineMultiInput() {
  console.log("running...");

  let total = 0;
  fromCSV.on("data", () => {
    total++;
  });

  const collectionPipe = new stream.PassThrough();

  let processedPaths = 0;
  const filePaths = [
    "input/file-0.csv",
    "input/file-1.csv",
    "input/file-2.csv",
  ];

  for (const path of filePaths) {
    const stream = getFileReadStream(path);
    const reader = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    let firstLine = true;
    reader.on("line", (data) => {
      if (firstLine) {
        firstLine = false;
        return;
      }
      collectionPipe.push(
        `${["ID", "Title", "Description", "Status", "Source"].join(
          ",",
        )}\n${data}`,
      );
    });
    reader.on("close", () => {
      processedPaths++;
      if (processedPaths === 3) collectionPipe.push(null);
    });
  }

  await pipeline(
    collectionPipe,
    fromCSV,
    toJSON,
    getWriteStream("output/fanPipelineMultiInput.json"),
  );

  console.log("done. total: ", total);
}

async function linearPipelineMultiInput() {
  console.log("running...");

  let total = 0;
  fromCSV.on("data", () => {
    total++;
  });

  await pipeline(
    new MultiReadable([
      "input/file-0.csv",
      "input/file-1.csv",
      "input/file-2.csv",
    ]),
    fromCSV,
    toJSON,
    getWriteStream("output/linearPipelineMultiInput.json"),
  );

  console.log("done. total: ", total);
}

async function linearPipelineSingleInput() {
  console.log("running...");

  let total = 0;
  fromCSV.on("data", () => {
    total++;
  });

  await pipeline(
    getFileReadStream("input/file-0.csv"),
    fromCSV,
    toJSON,
    getWriteStream("output/linearPipelineSingleInput.json"),
  );

  console.log("done. total: ", total);
}

async function main() {
  // await linearPipelineSingleInput();
  // await linearPipelineMultiInput();
  await fanPipelineMultiInput();
}

main();
