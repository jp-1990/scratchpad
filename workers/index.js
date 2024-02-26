const { Worker } = require("worker_threads");

const jobs = Array.from({ length: 100 }, () => 1e9);

function splitJobs(jobs, n) {
  const chunks = [];
  for (let i = n; i > 0; i--) {
    chunks.push(jobs.splice(0, Math.ceil(jobs.length / i)));
  }
  return chunks;
}

function runParallel(jobs, concurrency) {
  console.log("starting count...");
  const start = performance.now();
  const chunks = splitJobs(jobs, concurrency);
  let done = 0;

  chunks.forEach((data, i) => {
    const worker = new Worker("./worker.js");
    worker.postMessage(data);
    worker.on("message", () => {
      console.log(`worker ${i} completed`);
      done++;
      if (done === concurrency) {
        const end = performance.now();
        console.log(`${concurrency} workers took: ${end - start}ms`);
        process.exit();
      }
    });
  });
}

function runSingle(jobs) {
  console.log("starting count...");
  const start = performance.now();

  for (const job of jobs) {
    let count = 0;
    for (let i = 0; i < job; i++) count++;
  }

  const end = performance.now();
  console.log(`single: ${end - start}ms`);
}

// runSingle(jobs);
runParallel(jobs, 12);
