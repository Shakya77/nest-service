"use client";

import {
  Button,
  Carousel,
  Col,
  Divider,
  Flex,
  Image,
  InputNumber,
  List,
  Row,
  Typography,
} from "antd";
import { useRef, useState } from "react";
import CardComponent from "../CardComponent";

const { Title, Text } = Typography;

const images = [
  "https://picsum.photos/500/600?random=1",
  "https://picsum.photos/500/600?random=2",
  "https://picsum.photos/500/600?random=3",
  "https://picsum.photos/500/600?random=4",
  "https://picsum.photos/500/600?random=5",
];

const data = [
  "24.5-inch Rapid IPS panel with Full HD resolution for sharp and vibrant visuals",
  "Ultra-smooth 300Hz refresh rate for elite competitive gaming performance",
  "Lightning-fast 0.5ms (GtG) response time for minimal motion blur",
  "AMD FreeSync™ Premium ensures tear-free and stutter-free gameplay",
  "Wide color coverage with 120% sRGB and 1.07 billion colors",
  "HDR Ready support enhances contrast and visual depth",
  "DisplayPort 1.4a supports full 300Hz performance for esports use",
  "Frameless design ideal for immersive multi-monitor setups",
  "Anti-glare coating improves visibility during long gaming sessions",
  "Ergonomic tilt adjustment and VESA mount compatibility for flexible setup",
];

export default function ProductDetail() {
  const carouselRef = useRef(null);
  const [current, setCurrent] = useState(0);

  const onChange = (value) => {
    console.log(value);
  };

  return (
    <div className="container mx-auto p-4">
      <Row gutter={32} justify="center" align="top">
        <Col xs={24} sm={24} md={10} lg={6} style={{ textAlign: "center" }}>
          <Carousel
            ref={carouselRef}
            afterChange={(index) => setCurrent(index)}
            infinite={false}
            arrows
          >
            {images.map((img, idx) => (
              <Image
                src={img}
                alt={`Product ${idx}`}
                preview={false}
                width={"fit-content"}
              />
            ))}
          </Carousel>

          <Row gutter={8} style={{ marginTop: 16, justifyContent: "center" }}>
            {images.map((img, idx) => (
              <Col key={idx}>
                <Image
                  src={img}
                  preview={true}
                  width={60}
                  style={{
                    border:
                      current === idx
                        ? "2px solid #1890ff"
                        : "1px solid #d9d9d9",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    carouselRef.current.goTo(idx);
                  }}
                />
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={24} sm={24} md={14} lg={12}>
          <Title level={3}>
            MSI MAG 255XF 300Hz 24.5 Inch FHD Gaming Monitor
          </Title>
          <Divider></Divider>

          <Title level={4}>Key Features :</Title>

          {data.map((item, index) => (
            <Text key={index} style={{ display: "block", marginBottom: 8 }}>
              * {item}
            </Text>
          ))}

          <Divider></Divider>

          <Flex gap="medium">
            <InputNumber
              min={1}
              max={10}
              defaultValue={1}
              onChange={onChange}
            />

            <Button type="primary" size="large">
              Buy Now
            </Button>
          </Flex>
        </Col>
      </Row>

      <Row gutter={[0, 32]} justify="start" align="top">
        {Array.from({ length: 6 }).map((_, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <CardComponent id={index} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
