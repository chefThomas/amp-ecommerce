import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { Hub } from "aws-amplify";
import checkUser from "./checkUser";

const Nav = (props) => {
  const { current } = props;
  const [user, updateUser] = useState({});
  useEffect(() => {
    checkUser(updateUser);
    // set event listener for signin/out events
    Hub.listen("auth", (data) => {
      const {
        payload: { event },
      } = data;
      console.log("event: ", event);
      if (event === "signIn" || event === "signOut") checkUser(updateUser);
    });
  }, []);

  return (
    <div>
      <Menu selectedKeys={[current]} mode="horizontal">
        <Menu.Item key="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="profile">
          <Link to="/profile">Profile</Link>
        </Menu.Item>
        {user.isAuthorized && (
          <Menu.Item key="admin">
            <Link to="/admin">Admin</Link>
          </Menu.Item>
        )}
      </Menu>
    </div>
  );
};

export default Nav;
