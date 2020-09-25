# AWS DynamoDB Batch Upload Demo

## What

I am building a prototype app with Amplify on the backend. I want to be able to quicky insert records into my DynamoDB Table so I can get on with building out the app.

The table has a structure of:

```json
{
  "chinese": "STRING",
  "english": "STRING",
  "id": "STRING",
  "pinyin": "STRING"
}
```

The input data is an array of these type of objects

```json
[
  {
    "english": "Able",
    "chinese": "能, 能够",
    "pinyin": "Néng, Nénggòu"
  }
]
```

Batch loading about 156 of these objects into the table should be simple right?

Hmmm...

## Data - adding fields

@ `data/original/all-verbs.json` contains the original data. The items do not have a uuid but it might be useful to assign a uuid to each item.

@ `src/utils/add-id.js` contains a script that adds a uuid to each object. Now the fields in the json data match the table on DynamoDB

At the end of the file I call the function 3 times to generate 3 files with arrays containing 1, 10 and all-items from the original data. These files are generated @ `src/data/with-id` by calling the function `node ./src/utils/add-id.js`

Its convenient to have different length arrays of starting data to test various options for uploading data to DynamoDB.

## Using AWS CLI

You can upload data from the command line using the AWS CLI. If you Google you'll quickly find this command:

```
aws dynamodb put-item --table-name YOUR-TABLE-NAME --item file://YOUR-DATA.json
```

Obviously you need the AWS CLI installed and configured. Importantly, it may not be configured for the same region your DynamoDB Table is using.

AWS CLI is going to use your default profile, unless you tell it otherwise, that's where the default region is set.

To test this you might try with a single item of data. The `dynamodb put-item` command processes one item into the database:

```json
{
  "id": "2",
  "english": "Accept",
  "chinese": "接受",
  "pinyin": "Jiēshòu"
}
```

When I tried this it fails. The cryptic documentation and code examples led me to think that I needed to pass in a json object containing type information that DynamoDB understands.

This format works with the above command... This format is used to pass type information to DynamoDB for each field (the field "id" is of type "STRING" and has a value of "2"...)

```json
{
  "PutRequest": {
    "Item": {
      "id": {
        "S": "2"
      },
      "english": {
        "S": "Accept"
      },
      "chinese": {
        "S": "接受"
      },
      "pinyin": {
        "S": "Jiēshòu"
      }
    }
  }
}
```

### Trying batch-write-item on arrays

So, since the `put-item` command works with the above formatted item I assumed the `batch-write-item` would work for a similarly formatted array of many objects

```bash
aws dynamodb batch-write-item --request-items file://FORMATTED-DATA-ARRAY.json
```

First I wrote a script to transform the data to the above format containing the type info for each field.

@ `utils/transform-for-cli.js` contains a script which, when run with the data @ `src/data/with-id ` generates data in @ `src/data/formatted-for-cli/`

The `aws dynamodb batch-write-item` command works with the 10 item array of data but fails with the full data set!

The output from the failed operation is long and verbose and not helpful but at the end there is a line stating that the dataset cannot contain less than one item, and, not more than 25 items.

So it is necessary to loop through the items in the data and process them in batches of 25 or less.

## Enter AWS SDK

So, looping means writing a function and that means not using the CLI...

To call an AWS API in code (and not on the command line) I needed AWS SDK installed. Luckily, since I am running these scripts on my local machine the SKD picks up the default configuration profile generated when I installed the AWS CLI.

> However if I were running these srcipts on an EC2 instance I would need to grant the instance a role to access DynamoDB (don't use credentials on instances - use roles!)

## Looping over the data

My starting point was this post: [Use batchwriteitem to write more than 25 items to dynamodb table](https://stackoverflow.com/questions/43371962/how-to-use-batchwriteitem-to-write-more-than-25-items-into-dynamodb-table-using)

**Solution 1** is a lambda function for batch processing data into a DynamoDB Table.

That's great if you want to run your data imports against a file in an S3 bucket. Or some other automated process running periodically. Which is well worth the effort if data is constanly coming in...

But I want to run it locally with a simple dataset one time to populate the DynamoDB Table...

So, backing out the lambda specific code left me with this function @ `src/docClient-batchWrite.js`

The interesting thing about this function is that uses document client.

> [DynamoDB document client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)

> The DynamoDB document client simplifies working with items by abstracting the notion of attribute values. This abstraction annotates native JavaScript types supplied as input parameters, as well as converts annotated response data to native JavaScript types.

That's as clear as mud! Working through the errors led me to understand (perhaps mistakenly,) that document client takes care of typing your items as you pass them to DynamoDB, when working in javascript.

So this function runs against the files @ `src/data/with-id` in other words, it takes simple arrays of json data as input:

```json
[
  {
    "english": "Able",
    "chinese": "能, 能够",
    "pinyin": "Néng, Nénggòu",
    "id": "e9052984-f41e-437a-85f5-94908d51a774"
  }
]
```

Which is great...

And it works!

Hope this helps...
