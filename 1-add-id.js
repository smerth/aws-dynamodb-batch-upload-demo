const arr = require("./data-start.json");
const fs = require("fs");

let i = 0,
  ln = arr.length;
for (i; i < ln; i++) {
  arr[i].id = i + 1;
}

let json = JSON.stringify(arr);

fs.writeFile("data-with-id.json", json, function (err) {
  if (err) return console.log(err);
});

console.log(json);
