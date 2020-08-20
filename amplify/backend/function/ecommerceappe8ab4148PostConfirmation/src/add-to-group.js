/* eslint-disable-line */ const aws = require("aws-sdk");

exports.handler = async (event, context, callback) => {
  const cognitoWorker = new aws.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-18",
  });

  let isAdmin = false;
  const adminEmails = ["thomcdixon@gmail.com"];

  // set isAdmin to true if user is admin
  if (adminEmails.indexOf(event.request.userAttributes.email) !== -1) {
    isAdmin = true;
  }

  if (isAdmin) {
    const groupParams = {
      GroupName: "Admin",
      UserPoolId: event.userPoolId,
    };

    const userParams = {
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: "Admin",
    };

    try {
      // check to see if group exists
      await cognitoWorker.getGroup(groupParams).promise();
    } catch (e) {
      // make group if not
      await cognitoWorker.createGroup(groupParams).promise();
    }
    try {
      await cognitoWorker.adminAddUserToGroup(userParams).promise();
      callback(null, event);
    } catch (e) {
      callback(e);
    }
  } else {
    // if user is not an admin, take no action
    callback(null, event);
  }
};
