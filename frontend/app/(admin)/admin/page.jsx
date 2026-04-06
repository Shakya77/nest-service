"use client";

import { useEffect, useState } from "react";
import { Card, Space, Typography, message } from "antd";
import api from "@/lib/api";

const { Title, Text } = Typography;

export default function page() {
  const [todaysIncome, setTodaysIncome] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/payments");
      setTodaysIncome(data.total);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="admin-card" style={{ display: "grid", gap: 16 }}>
      <Card>
        <Title level={3} style={{ marginBottom: 4 }}>
          Overview
        </Title>
        <Text type="secondary">
          Track rentals, staff activity, and new quote requests from here.
        </Text>
      </Card>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <Card loading={loading}>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">Most booked vehicle</Text>
            <Title level={4} style={{ margin: 0 }}></Title>
            <Text type="secondary"></Text>
          </Space>
        </Card>
        <Card loading={loading}>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">Most working employee</Text>
            <Title level={4} style={{ margin: 0 }}></Title>
            <Text type="secondary"></Text>
          </Space>
        </Card>
        <Card loading={loading}>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">Today's Income</Text>
            <Title level={4} style={{ margin: 0 }}>
              Rs. {Number(todaysIncome || 0).toFixed(2)}
            </Title>
          </Space>
        </Card>
      </div>
    </div>
  );
}
