import { argv } from "process";
import { createReadStream, existsSync } from "fs";

if (!argv[2]) throw new Error("Specify a file to read");

const FILE_PATH = argv[2];

if (!existsSync(FILE_PATH)) throw new Error("File not found.");

const HIGH_WATER_MARK = 0.25 * 1024 * 1024; // 256 KB per chunk
const WEATHER_STATIONS = {};

const stream = createReadStream(FILE_PATH, { encoding: "utf-8", highWaterMark: HIGH_WATER_MARK });

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
          const [stationName, tempratureValue] = lines[i].split(":");
          const temperature = Number(tempratureValue);
          const station = WEATHER_STATIONS[stationName];
          if (!station) {
               WEATHER_STATIONS[stationName] = {
                    min: temperature,
                    max: temperature,
                    total: temperature,
                    count: 1
               };
               continue;
          }
          // check for min temp
          if (station.min > temperature) {
               station.min = temperature;
          }
          // check for max temp
          if (station.max < temperature) {
               station.max = temperature;
          }
          // update total and count
          station.total = station.total + temperature;
          station.count = station.count + 1;
     }
});

stream.on("end", () => {
     console.timeEnd("");
     return;
     // sort alphabetically
     const finalArray = Object.entries(WEATHER_STATIONS).sort(([stationA], [stationB]) => {
          if (stationA < stationB) {
               return -1;
          }
          if (stationA > stationB) {
               return 1;
          }
          return 0;
     });

     // print results in the final format
     for (const [station, data] of finalArray) {
          // Abha=-23.0/18.0/59.2
          console.log(`${station}=${data.min}/${(data.total / data.count).toFixed(2)}/${data.max}`);
     }
});
