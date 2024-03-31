import EventEmitter from "events";
import { createReadStream, existsSync } from "fs";
import { spawn, Worker } from "threads";

if (!process.argv[2]) throw new Error("Specify a file to read");

const FILE_PATH = process.argv[2];

if (!existsSync(FILE_PATH)) throw new Error("File not found.");

const HIGH_WATER_MARK = 100 * 1024 * 1024; // 256 KB per chunk
const WEATHER_STATIONS = {};

const start = new EventEmitter();
const stream = createReadStream(FILE_PATH, { encoding: "utf-8", highWaterMark: HIGH_WATER_MARK });
const TASKS = [];

console.time("");

// ugly but performant solution
stream.on("data", async (data) => {
     const parse = await spawn(new Worker("./worker"));
     TASKS.push(parse(data));
});

stream.on("end", async () => {
     console.log("file read completely.");
     start.emit("start");
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

start.on("start", async () => {
     console.log("started parsing for results.");
     setTimeout(async () => {
          await Promise.all(TASKS);
          console.timeEnd("");
          process.exit(0);
     }, 2000);
});
