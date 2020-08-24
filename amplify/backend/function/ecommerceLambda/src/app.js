/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	AUTH_ECOMMERCEAPPE8AB4148_USERPOOLID
	STORAGE_PRODUCTS_ARN
	STORAGE_PRODUCTS_NAME
Amplify Params - DO NOT EDIT */

// auto-gen boilerplate
var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// Config for interactions with DB added by me begin ++++++++
const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");

// Cognito SDK
const cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

// Cognito User Pool ID stored as ENV variable (autogen by Cognito)
const userPoolId = process.env.AUTH_ECOMMERCEAPPE8AB4148_USERPOOLID;

// DynamoDB config
const region = process.env.REGION;
const dbProductsTable = process.env.STORAGE_PRODUCTS_NAME;
const docClient = new AWS.DynamoDB.DocumentClient({ region });

// END DB CONFIG  +++++++++++++++++++++++++++++++

// API auth functions added by me begin +++++++++++
// parses event to check API callers permission group memberships
async function getGroupsForUser(event) {
  let userSub = event.requestContext.identity.cognitoAuthenticationProvider.split(
    ":CognitoSignIn:"
  )[1];

  console.log("################# 1: ", userSub); // check
  console.log("################# 1.2: ", userPoolId); // check

  let userParams = {
    UserPoolId: userPoolId,
    Filter: `sub = \"${userSub}\"`,
  };

  console.log("################################### 1.3 ", userParams);

  let groupParams;
  try {
    // ########## this returns no users
    let userData = await cognito.listUsers(userParams).promise();
    const user = userData.Users[0];
    console.log("################################### 1.4 ", userData);
    groupParams = {
      UserPoolId: userPoolId,
      Username: user.Username,
    };
  } catch (error) {
    console.log("################# 2: ", error);
  }

  try {
    const groupData = await cognito
      .adminListGroupsForUser(groupParams)
      .promise();
    console.log("################# 3: ", groupData);
    return groupData;
  } catch (error) {
    console.log("get group data on user", error);
  }
}

// checks if user is auth'd and belongs to user group passed in as second arg
function canPerformAction(event, group) {
  return new Promise(async (resolve, reject) => {
    // checks if auth'd
    if (!event.requestContext.identity.cognitoAuthenticationProvider) {
      return reject();
    }
    try {
      // get user group data
      // ERROR
      const groupData = await getGroupsForUser(event);
      // create array of groups that user belongs to
      const groupsForUser = groupData.Groups.map((group) => group.GroupName);
      // does user belong to group with permission to perform action?
      if (groupsForUser.includes(group)) {
        resolve();
      } else {
        reject("user not in group, cannot perform action..");
      }
    } catch (error) {
      console.log(error);
    }
  });
}

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Retrieve all products from db
async function getItems() {
  let params = { TableName: dbProductsTable };
  try {
    const data = await docClient.scan(params).promise();
    return data;
  } catch (err) {
    return err;
  }
}

app.get("/products", async function (req, res) {
  try {
    const data = await getItems();
    res.json({ data: data });
  } catch (err) {
    res.json({ error: err });
  }
});

// app.get("/products/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "get call succeed!", url: req.url });
// });

/****************************
 * Example post method *
 ****************************/

app.post("/products", async function (req, res) {
  // 502 error with canPerformAction call. Anyone can make this post req :(

  const { body } = req;
  const { event } = req.apiGateway;

  console.log("############### EVENT ################", event);
  try {
    await canPerformAction(event, "Admin");
    const input = { ...body, id: uuid() };
    const params = {
      TableName: dbProductsTable,
      Item: input,
    };
    const result = await docClient.put(params).promise();
    console.log(
      "####################### RESULT #############################",
      result
    );
    res.json({ success: "item save to database..." });
  } catch (err) {
    res.json({ error: err });
  }
});

// app.post("/products/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "post call succeed!", url: req.url, body: req.body });
// });

/****************************
 * Example put method *
 ****************************/

app.put("/products", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

app.put("/products/*", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete("/products", async function (req, res) {
  const { event } = req.apiGateway;
  try {
    await canPerformAction(event, "Admin");
    const params = {
      TableName: dbProductsTable,
      Key: { id: req.body.id },
    };
    await docClient.delete(params).promise();
    res.json({ success: "deletion successful" });
  } catch (err) {
    res.json({ error: err });
  }
});

app.delete("/products/*", function (req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
