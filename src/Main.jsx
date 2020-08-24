import React, { useState, useEffect } from "react";
import Container from "./Container";
import { API } from "aws-amplify";
import { Button, List } from "antd";
import checkUser from "./checkUser";

// renders item inventory
const Main = () => {
  const [state, setState] = useState({ products: [], loading: true });
  const [user, setUser] = useState({});
  let didCancel = false;
  useEffect(() => {
    getProducts();
    checkUser(setUser);
    return () => (didCancel = true);
  }, []);

  async function getProducts() {
    try {
      const data = await API.get("ecommerceRESTapi", "/products");
      console.log("data: ", data);
      if (didCancel) return;
      setState({
        products: data.data.Items,
        loading: false,
      });
    } catch (err) {
      console.log("Error loading products... ", err);
    }
  }

  async function deleteItem(id) {
    try {
      const products = state.products.filter((p) => p.id !== id);
      setState({ ...state, products });
      await API.del("ecommerceRESTapi", "/products");
      console.log("Item deleted");
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <Container>
      <List
        itemLayout="horizontal"
        dataSource={state.products}
        loading={state.loading}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button onClick={() => deleteItem(item.id)}>delete</Button>,
            ]}
          >
            <List.Item.Meta title={item.name} description={item.price} />
          </List.Item>
        )}
      />
    </Container>
  );
};

export default Main;
