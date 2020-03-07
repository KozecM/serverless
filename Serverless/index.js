// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express()
const AWS = require('aws-sdk');


const USERS_TABLE = "Users";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const SQS_URL = "https://sqs.us-east-1.amazonaws.com/383829852699/reporting.fifo"

app.use(cors());

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// Get User endpoint
app.post('/save-user',  (req, res) => {
  var id = req.query.id;
  var name = req.query.name;
  var email = req.query.email;

  var params = {
    TableName: USERS_TABLE,
    Item: {
      Prime: email,
      name: name,
      Sort: id
    },
  }

  console.log(params);

  dynamoDb.put(params, function(err, data) {
    if (err) res.send("ERROR\n", err);
    else{
      console.log(data);
      res.sendStatus(201);
    } 
  });
})

app.post('/user/playlist', (req, res) => {
  var songid = req.query.song;
  var id = req.query.id;
  var name = req.query.name;

  var params = {
    Item: {
      Prime: id,
      Sort: songid,
      name: name,
      playlist: "playlist"
    },
    TableName: USERS_TABLE
  }

  dynamoDb.put(params, function(err, data) {
    if (err) res.send("ERROR\n", err);
    else{
      console.log(data);
      res.sendStatus(201);
    } 
  });
})

app.get('/user/playlist', (req,res) => {
  var id = req.query.id;
  var result = [];
  
  var params = {
    TableName: USERS_TABLE,
    KeyConditionExpression: "Prime = :v1",
    ExpressionAttributeValues: {
      ':v1': id,  
    }
  };

  dynamoDb.query(params).promise().then(function ( data) {
    data.Items.forEach((i) => {
      result.push(i);
    });
    // console.log("result: ", result);
    res.status(201).send(result);
  }).catch((error) => {
    res.status(401).send(error);
  });
})


app.post('/play', (req,res) => {
  var song = req.query.song;
  var album = req.query.album;
  var artist = req.query.artist;
  const date = Date.now() + "";
  const message = song + " was just played! Pay "+ artist + " now!"

  var params = {
    MessageAttributes: {
      "Artist": {
        DataType: "String",
        StringValue: artist
      },
      "Album": {
        DataType: "String",
        StringValue: album
      },
      "Song": {
        DataType: "String",
        StringValue: song
      },
    },
    MessageBody: message,
    MessageDeduplicationId: date,
    MessageGroupId: "Group1",
    QueueUrl: SQS_URL
  }

  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      res.status(400).send("ERROR: " + err);
    } else {
      console.log("Success", data.MessageId);
      res.status(200).send("Success!: " + data.MessageId);
    }
  })

  console.log(artist);
})

module.exports.handler = serverless(app);