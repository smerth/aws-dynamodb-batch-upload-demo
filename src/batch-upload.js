// NEW SCRIPT
var AWS = require("aws-sdk");
// We just need an array of objects (no type info)
const data = require("../data/with-id/all-verb.json");
const table = "HanyuVerb-wheen322rvedlhsckmscknosji-dev";

AWS.config.update({ region: "us-east-1" });

var docClient = new AWS.DynamoDB.DocumentClient();

// Build the batches
var batches = [];
var current_batch = [];
var item_count = 0;

for (var i = 0; i < data.length; i++) {
  // Add the item to the current batch
  item_count++;
  current_batch.push({
    PutRequest: {
      Item: data[i],
    },
  });
  // If we've added 25 items, add the current batch to the batches array
  // and reset it
  if (item_count % 25 === 0) {
    batches.push(current_batch);
    current_batch = [];
  }
}

// Add the last batch if it has records and is not equal to 25
if (current_batch.length > 0 && current_batch.length !== 25) {
  batches.push(current_batch);
}

// Handler for the database operations
var completed_requests = 0;
var errors = false;

function requestHandler(request) {
  console.log("in the handler: ", request);

  return function (err, data) {
    // Increment the completed requests
    completed_requests++;

    // Set the errors flag
    errors = errors ? true : err;

    // Log the error if we got one
    if (err) {
      console.error(JSON.stringify(err, null, 2));
      console.error("Request that caused database error:");
      console.error(JSON.stringify(request, null, 2));
      // callback(err);
    } else {
      /* var response = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(data),
        isBase64Encoded: false,
      }; */
      console.log(`success: returned ${data}`);
      // callback(null, response);
    }

    // Make the callback if we've completed all the requests
    if (completed_requests === batches.length) {
      // cb(errors);
      console.log("complete");
    }
  };
}

// Make the requests
var params;
for (var j = 0; j < batches.length; j++) {
  // Items go in params.RequestItems.id array
  // Format for the items is {PutRequest: {Item: ITEM_OBJECT}}
  params = '{"RequestItems": {"' + table + '": []}}';
  params = JSON.parse(params);
  params.RequestItems[table] = batches[j];

  console.log("before db.batchWrite: ", params);

  // Perform the batchWrite operation
  docClient.batchWrite(params, requestHandler(params));
}
