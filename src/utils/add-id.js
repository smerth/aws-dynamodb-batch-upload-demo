const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const arr = require("../../data/original/all-verbs.json");

function addUniqueId(size) {
  let i = 0;
  let ln = arr.length;
  for (i; i < ln; i++) {
    let id = uuidv4();
    arr[i].id = id;
  }

  // luckily if size isn't provided, everything is spliced!
  const newArray = arr.slice(0, size);

  let output = JSON.stringify(newArray);

  fs.writeFile(`./data/with-id/${size || "all"}-verb.json`, output, function (
    err
  ) {
    if (err) return console.log(err);
  });
}

addUniqueId(1);
addUniqueId(10);
addUniqueId();
