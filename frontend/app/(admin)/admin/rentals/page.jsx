"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button, Card, Space, Table, Tag, Typography, message } from "antd";
import api from "@/lib/api";

const { Title, Text } = Typography;

const statusColor = {
  assigned: "blue",
  in_progress: "gold",
  completed: "green",
};

export default function page() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rentals");
      setRentals(data);
    } catch (err) {
      message.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const columns = [
    {
      title: "Rental ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleName",
      key: "vehicleName",
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
    },
    {
      title: "Staff",
      dataIndex: "staffName",
      key: "staffName",
      render: (value) => value || "Not assigned",
    },
    {
      title: "Scheduled",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (value) =>
        value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-",
    },
    {
      title: "Total Cost",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (value) => (value ? Number(value).toFixed(2) : "0.00"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={statusColor[value] || "default"}>{value}</Tag>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card variant="borderless">
        <Space
          style={{ width: "100%", justifyContent: "space-between" }}
          align="start"
        >
          <div>
            <Title level={3}>Rentals</Title>
            <Text type="secondary">
              Simple rental list with current status.
            </Text>
          </div>
          <Button onClick={fetchRentals}>Refresh</Button>
        </Space>
      </Card>
      <Card variant="borderless">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rentals}
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
}
