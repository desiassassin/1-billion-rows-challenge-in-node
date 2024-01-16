// usage: node generate.js <number of rows to generate>

import { argv } from "process";
import { readFileSync, writeFileSync } from "fs";

const tick = performance.now();

const COUNT = Number(argv[2].replace(/_/g, "")) || 1000;
const SEPERATOR = ":";
const TEMP = {
     MIN: -50,
     MAX: 100
};

// read file
console.time("Reading file");
const rowData = readFileSync("./data/weather_stations.txt", { encoding: "utf-8" })
     .split("\n")
     .map((string) => string.split(SEPERATOR));
console.timeEnd("Reading file");

const FINAL_DATA = [];

console.time("Creating data");
for (let i = 1; i <= COUNT; i++) {
     const randomIndex = getRandomInt(0, rowData.length - 1);
     const randomTemp = getRandomFloat(TEMP.MIN, TEMP.MAX);
     try {
          FINAL_DATA.push(`${rowData[randomIndex][0]}${SEPERATOR}${randomTemp}`);
     } catch (error) {
          console.error(randomIndex, error);
          process.exit(1);
     }
}
console.timeEnd("Creating data");

console.time(`Writing ${COUNT} records to file`);
writeFileSync(`./data/${argv[2]}.txt`, FINAL_DATA.join("\n"));
console.timeEnd(`Writing ${COUNT} records to file`);

const tock = performance.now();

console.log(`DONE in ${(tock - tick) / 1000} seconds.`);

function getRandomInt(min, max) {
     min = Math.ceil(min);
     max = Math.floor(max);
     return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(min, max) {
     return Math.random() * (max - min + 1) + min;
}
