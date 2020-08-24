import React, { useState } from "react";
import { Button, Input } from "antd";
import { API } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";

import Style from "./styles/style";

const initialState = {
  name: "",
  price: "",
};

// This component contains a form we use to add inventory to the store
const Admin = () => {
  const [itemInfo, setItemInfo] = useState(initialState);
  function updateForm(e) {
    const formData = {
      ...itemInfo,
      [e.target.name]: e.target.value,
    };
    setItemInfo(formData);
  }

  async function addItem() {
    try {
      const data = {
        body: { ...itemInfo, price: parseInt(itemInfo.price) },
      };
      setItemInfo(initialState);
      console.log(data);
      await API.post("ecommerceRESTapi", "/products", data);
    } catch (err) {
      console.log("error adding item...");
    }
  }

  return (
    <div style={Style.profile.container}>
      <Input
        name="name"
        onChange={updateForm}
        value={itemInfo.name}
        placeholder="Item name"
        style={Style.input}
      />
      <Input
        name="price"
        onChange={updateForm}
        value={itemInfo.price}
        placeholder="Item price"
        style={Style.input}
      />
      <Button onClick={addItem} style={Style.button}>
        Add Item
      </Button>
    </div>
  );
};

export default withAuthenticator(Admin);
