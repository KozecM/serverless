// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express()
const AWS = require('aws-sdk');


const USERS_TABLE = "SLSUsers";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const UID = '';

app.use(cors());

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// Get User endpoint
app.post('/save-user',  (req, res) => {
  UID = req.query.id;
  var name = req.query.name;
  var email = req.query.email;

  var params = {
    TableName: USERS_TABLE,
    Item: {
      Primary: UID,
      name: name,
      Sort: email
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

app.post('user/playlist', (req, res) => {
  var songid = req.query.songid;

  var params = {
    Item: {
      Primary: UID,
      Sort: songid,
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

app.get('user/playlist', (req,res) => {
  var result = []
  var params = {
    TableName: USERS_TABLE,
    FilterExpression: 'Primary = :uid and playlist = :play',
    ExpressionAttributeValues: {
      ':uid': UID,
      ':play': "playlist"
    }
  };

  dynamoDb.scan(params, function (err, data) {
    if (err) console.log(err);
    else{
      data.Items.forEach((i) => {
        result.push(i.SortKey);
      });
      // console.log("result: ", result);
      return result;
    } 
  });
})


module.exports.handler = serverless(app);