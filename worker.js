import { expose } from "threads/worker";
const WEATHER_STATIONS = {};

expose(async function parse(data) {
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
          if (newLineIndex === -1) return;

          // assign the next index of "\n" as the current index to get the next line in the next iteration
          newLineIndex = nextNewLineIndex;
     }

     return WEATHER_STATIONS;
});
