import React from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import Style from "./styles/style";
import "./App.css";

/* 
Render profile and sign-out button if user signed-in, else render sign-up/in flow
*/
const Profile = () => {
  return (
    <div style={Style.profile.container}>
      <AmplifySignOut />
    </div>
  );
};

export default withAuthenticator(Profile);
