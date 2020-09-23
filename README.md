# Hanyu Data

https://onlinetsvtools.com/convert-tsv-to-json

https://www.json2yaml.com/

## 150 Chinese Verbs

https://www.howtosayinchinese.com/simple-easy-basic-chinese-verbs-list/

## Tests using AWS CLI

You can upload data from the command line using the CLI

### Single item

```bash
 aws dynamodb put-item --table-name YOUR-TABLE-NAME --item file://test-cli-single.json
```

Note the formatting of this json. It defines a `PutRequest` key telling the `aws dynamo` api what action we want to perform. We are passing in the `--table-name` argument so we don't need to define a key in the json for the table.

### Multiple items

```bash
aws dynamodb batch-write-item --request-items file://test-cli-batch.json
```

This json defines a key for the `table-name` and then a key for the action we want to perform (`PutRequest`).

So, it is possible in this batch operation to define different actions for different items within the same table.

This command works with two items but fails with the full data set. The output is long and verbose and not helpful but at the end there is a line implying that the dataset cannot contain less than one item, and, not more than 25 items.

So it is necessary to loop through the items in the data and process them in batches of 25 or less.

For that we need a script. To get access to the `dynamodb` api inside the script we can use the AWS SDK, we're not on the command line anymore!

## AWS SDK inside a nodejs script
