// usage: node generate.js <number of rows to generate>

import { argv } from "process";
import { readFileSync, createWriteStream } from "fs";

const COUNT = Number(argv[2].replace(/_/g, "")) || 1000;
const SEPERATOR = ":";
const TEMP = {
     MIN: -50,
     MAX: 100
};
const CHUNK_LIMIT = 1_000_000;

const tick = performance.now();

// read file
console.time("Reading file");
const rowData = readFileSync("./data/weather_stations.txt", { encoding: "utf-8" })
     .split("\n")
     .map((string) => string.split(SEPERATOR));
console.timeEnd("Reading file");

let FINAL_DATA = [];

const writeStream = createWriteStream(`./data/${argv[2]}.txt`, { flags: "a" });

console.time("Creating and writing data");

for (let i = 1; i <= COUNT; i++) {
     const randomIndex = getRandomInt(0, rowData.length - 1);
     const randomTemp = getRandomFloat(TEMP.MIN, TEMP.MAX);
     FINAL_DATA.push(`${rowData[randomIndex][0]}${SEPERATOR}${randomTemp}`);

     if (i % CHUNK_LIMIT === 0 || i === COUNT) {
          const chunk = i % 1_000_000 === 0 ? i / 1_000_000 : "Final";

          console.time(`Chunk ${chunk}`);
          await write(writeStream, FINAL_DATA.join("\n") + "\n");
          console.timeEnd(`Chunk ${chunk}`);

          FINAL_DATA = [];
     }
}
console.timeEnd("Creating and writing data");

writeStream.end();

const tock = performance.now();

console.log(`DONE in ${(tock - tick) / 1000} seconds.`);

async function write(stream, data) {
     return new Promise((resolve, reject) => {
          stream.write(data, () => resolve());
     });
}

function getRandomInt(min, max) {
     min = Math.ceil(min);
     max = Math.floor(max);
     return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(min, max) {
     return (Math.random() * (max - min + 1) + min).toFixed(2);
}
