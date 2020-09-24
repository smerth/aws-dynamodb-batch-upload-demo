// Copyright (c) 2020 smerth
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

var AWS = require("aws-sdk");

const params = require("../data/formatted-for-sdk/all-verbs.json");
// const dotenv = require("dotenv");
// dotenv.config();

// AWS.config.getCredentials(function (err) {
//   if (err) console.log(err.stack);
//   // credentials not loaded
//   else {
//     console.log("Access key:", AWS.config.credentials.accessKey);
//     console.log("Region: ", AWS.config.region);
//   }
// });

// Set the region
AWS.config.update({ region: "us-east-1" });

// Create DynamoDB service object
// Here is the latest api version: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html
var client = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

// ddb.batchWriteItem(params, function (err, data) {
//   //   console.log("params: ", params);
//   console.log("data.UnprocessedItems: ", data.UnprocessedItems);
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data);
//   }
// });

var write = function (batch, callback) {
  if (batch && batch.RequestItems) {
    client.batchWriteItem(batch, function (err, result) {
      if (err) {
        console.log(err);
        return callback(err);
      }

      if (Object.keys(result.UnprocessedItems).length !== 0) {
        console.log("Retry batchWriteItem: " + JSON.stringify(result, null, 2));
        retryCount++;
        var retry = {
          RequestItems: result.UnprocessedItems,
          ReturnConsumedCapacity: "INDEXES",
          ReturnItemCollectionMetrics: "SIZE",
        };
        // retry with exponential backoff
        var delay = retryCount > 0 ? 50 * Math.pow(2, retryCount - 1) : 0;
        setTimeout(write(retry, callback), delay);
        return;
      }

      callback(null, result);
    });
  } else {
    callback(null);
  }
};
