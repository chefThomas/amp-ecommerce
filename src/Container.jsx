import React from "react";
import Styles from "./styles/style";

const Container = ({ children }) => {
  return <div style={Styles.container}>{children}</div>;
};

export default Container;
