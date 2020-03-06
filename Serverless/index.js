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
    TableName: "Users",
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

// Create User endpoint
app.post('/users', function (req, res) {
  const { userId, name } = req.body;
  if (typeof userId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      name: name,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create user' });
    }
    res.json({ userId, name });
  });
})

module.exports.handler = serverless(app);