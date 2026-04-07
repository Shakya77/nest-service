"use client";

import { Row, Col } from "antd";
import CardComponent from "./CardComponent";

export default function ProductList() {
  // Example: 12 products
  const products = Array.from({ length: 12 });

  return (
    <Row gutter={[16, 16]} justify="center" align="middle">
      {products.map((_, index) => (
        <Col
          key={index}
          xs={{ flex: "100%" }}
          sm={{ flex: "50%" }}
          md={{ flex: "40%" }}
          lg={{ flex: "20%" }}
          xl={{ flex: "10%" }}
        >
          <CardComponent id={index} />
        </Col>
      ))}
    </Row>
  );
}
