const arr = require("./data-with-id.json");
const fs = require("fs");

let tableName = "HanyuVerb-wheen322rvedlhsckmscknosji-dev";

// let table = `${tableName}: []`;

// let data = `{"${tableName}": []}`;

// console.log(data);

let arrayOfItems = [];

let i = 0,
  ln = arr.length;
for (i; i < ln; i++) {
  let item = {
    PutRequest: {
      Item: {
        id: {
          S: arr[i].id.toString(),
        },
        english: {
          S: arr[i].english,
        },
        chinese: {
          S: arr[i].chinese,
        },
        pinyin: {
          S: arr[i].pinyin,
        },
      },
    },
  };

  let it = JSON.stringify(item);

  arrayOfItems.push(it);
}

console.log(arrayOfItems);
let data = `{"${tableName}": [${arrayOfItems}]}`;

// let json = JSON.stringify(data);

fs.writeFile("data-formatted.json", data, function (err) {
  if (err) return console.log(err);
});
