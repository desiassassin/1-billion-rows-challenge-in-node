import { argv } from "process";
import { createReadStream, existsSync } from "fs";

if (!argv[2]) throw new Error("Specify a file to read");

const FILE_PATH = argv[2];

if (!existsSync(FILE_PATH)) throw new Error("File not found.");

const WEATHER_STATIONS = {};

const stream = createReadStream(FILE_PATH, { encoding: "utf-8", highWaterMark: 1 * 1024 * 1024 });

let leftover = "";

console.time("");

// ugly but performant solution
stream.on("data", (data) => {
     // append any leftover to data
     if (leftover.length) data = leftover + data;

     const lines = data.split("\n");

     // put the last line into the leftover string
     leftover = lines[lines.length - 1];

     // remove the last line from the array
     lines.length = lines.length - 1;

     // parse the remaining lines into an array of weather stations and weather temperature
     for (let i = 0; i < lines.length; i++) {
          const bruh = lines[i].split(":");
          WEATHER_STATIONS[bruh[0]] = parseFloat(bruh[1]);
     }
});

stream.on("end", () => {
     console.log(Object.keys(WEATHER_STATIONS).length);
     console.timeEnd("");
});
