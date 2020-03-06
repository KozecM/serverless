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
  var id = req.query.id;
  var name = req.query.name;
  var email = req.query.email;

  var params = {
    TableName: USERS_TABLE,
    Item: {
      Primary: id,
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

app.post('/user/playlist', (req, res) => {
  var songid = req.query.song;
  var id = req.query.id;
  var name = req.query.name;

  var params = {
    Item: {
      Primary: id,
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
    FilterExpression: 'Primary = :uid and playlist = :play',
    ExpressionAttributeValues: {
      ':uid': id,
      ':play': "playlist"
    }
  };

  dynamoDb.query(params, function (err, data) {
    if (err) console.log(err);
    else{
      data.Items.forEach((i) => {
        result.push(i);
      });
      // console.log("result: ", result);
      res(result);
    } 
  });
})


module.exports.handler = serverless(app);