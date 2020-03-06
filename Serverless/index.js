// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express()
const AWS = require('aws-sdk');


const USERS_TABLE = "Users";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
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
      ID: id,
      name: name,
      email: email
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


module.exports.handler = serverless(app);