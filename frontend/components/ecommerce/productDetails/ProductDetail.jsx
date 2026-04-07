"use client";

import { Carousel, Col, Divider, Image, List, Row, Typography } from "antd";
import { useRef, useState } from "react";

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

  return (
    <Row gutter={[16, 16]} justify="start" align="middle">
      <Col span={12}>
        <Carousel
          ref={carouselRef}
          afterChange={(index) => setCurrent(index)}
          infinite={false}
          arrows
        >
          {images.map((img, idx) => (
            <div key={idx}>
              <Image
                src={img}
                alt={`Product ${idx}`}
                preview={false}
                style={{ width: "100%", margin: "0 auto" }}
              />
            </div>
          ))}
        </Carousel>

        <Row gutter={8} style={{ marginTop: 16, justifyContent: "center" }}>
          {images.map((img, idx) => (
            <Col key={idx}>
              <Image
                src={img}
                preview={false}
                width={60}
                style={{
                  border:
                    current === idx ? "2px solid #1890ff" : "1px solid #d9d9d9",
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

      <Col span={12}>
        <Title level={3}>
          MSI MAG 255XF 300Hz 24.5 Inch FHD Gaming Monitor
        </Title>
        <Divider></Divider>
        {data.map((item, index) => (
          <li key={index}>
            <Text style={{ display: "block", marginBottom: 8 }}>{item}</Text>
          </li>
        ))}
      </Col>
    </Row>
  );
}
