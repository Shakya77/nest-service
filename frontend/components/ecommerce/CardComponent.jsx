"use client";

import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Flex, Switch } from "antd";
import { Meta } from "antd/es/list/Item";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CardComponent({ id }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Card
      loading={loading}
      style={{ width: 300 }}
      cover={
        <img
          draggable={false}
          alt="example"
          src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        />
      }
      actions={[
        <Link href={`/ecommerce/product/${id}`}>
          <SettingOutlined key="setting" />
        </Link>,
        <EditOutlined key="edit" />,
        <EllipsisOutlined key="ellipsis" />,
      ]}
    >
      <Meta
        avatar={
          <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
        }
        title="Card title"
        description="This is the description"
      />
    </Card>
  );
}
