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
     if (leftover) data = leftover + data;

     let newLineIndex = data.indexOf("\n");

     while (newLineIndex > -1) {
          const nextNewLineIndex = data.indexOf("\n", newLineIndex + 1);

          const line = data.slice(newLineIndex + 1, nextNewLineIndex);

          // do the line parsing. indexOf is twice as fast than string.split()
          const colonIndex = line.indexOf(":");
          const stationName = line.slice(0, colonIndex);
          const temperature = Number(line.slice(colonIndex + 1));

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
          // update min max temp, total and count
          station.min = station.min > temperature ? temperature : station.min;
          station.max = station.max < temperature ? temperature : station.max;
          station.total = station.total + temperature;
          station.count++;

          // this was the final incomplete line, so store it in the leftover and break out of the loop
          if (newLineIndex === -1) {
               leftover = line;
               return;
          }

          // assign the next index of "\n" as the current index to get the next line in the next iteration
          newLineIndex = nextNewLineIndex;
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
