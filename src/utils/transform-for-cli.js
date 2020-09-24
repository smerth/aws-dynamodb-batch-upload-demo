const fs = require("fs");
const data = require("../../data/with-id/all-verb.json");

let tableName = "HanyuVerb-wheen322rvedlhsckmscknosji-dev";
let outputPath = "./data/formatted-for-sdk/all-verbs.json";

// The input file is an array of objects
// [
//   {
//     "id": "1",
//     "english": "Able",
//     "chinese": "能, 能够",
//     "pinyin": "Néng, Nénggòu"
//   },
// ]

// And his is the format accepted by AWS.dynamodb SDK...
// var params = {
//   RequestItems: {
//     "TABLE_NAME": [
//        {
//          PutRequest: {
//            Item: {
//              "KEY": { "N": "KEY_VALUE" },
//              "ATTRIBUTE_1": { "S": "ATTRIBUTE_1_VALUE" },
//              "ATTRIBUTE_2": { "N": "ATTRIBUTE_2_VALUE" }
//            }
//          }
//        },
//     ]
//   }
// };

function transformData() {
  let items = [];
  let i = 0;
  let ln = data.length;

  for (i; i < ln; i++) {
    let item = {
      PutRequest: {
        Item: {
          id: {
            S: data[i].id.toString(),
          },
          english: {
            S: data[i].english,
          },
          chinese: {
            S: data[i].chinese,
          },
          pinyin: {
            S: data[i].pinyin,
          },
        },
      },
    };

    let itemStr = JSON.stringify(item);

    items.push(itemStr);
  }

  let output = `{ "RequestItems": {"${tableName}": [${items}]} }`;

  fs.writeFile(`${outputPath}`, output, function (err) {
    if (err) return console.log(err);
  });
}

transformData();
