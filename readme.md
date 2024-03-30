# Start script

```js
// node generate.js <number of records>
node generate.js 100_000_000
```

Creates a file in `/data` called `100_000_000.txt` containg 100 million records.

# Benchmarks

```js
// node app.js <path to file>
node app.js ./data/100_000_000.txt
```

Creating a million records take roughly 155ms.
Created 100 million records in 1 min 14 seconds.

Parsing 10 million records took 3.5 seconds.
Parsing 100 million records took 35.5 seconds.
