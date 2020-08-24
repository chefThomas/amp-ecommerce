import { Auth } from "aws-amplify";

// check current user's info and call updateUser to update user logged in.
// if no user, return empty object
async function checkUser(updateUser) {
  try {
    const userData = await Auth.currentSession();
    if (!userData) {
      console.log("userData: ", userData);
      updateUser({});
      return;
    }
    const {
      idToken: { payload },
    } = userData;
    console.log(payload);
    const isAuthorized =
      payload["cognito:groups"] && payload["cognito:groups"].includes("Admin");
    updateUser({
      username: payload["cognito:username"],
      isAuthorized,
    });
  } catch (err) {
    console.log("error: ", err);
  }
}

export default checkUser;
