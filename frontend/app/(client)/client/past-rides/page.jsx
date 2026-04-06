"use client";

import api from "@/lib/api";
import { Card, message, Space, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "@/app/context/AuthContext";

const { Title, Text } = Typography;

export default function page() {
  const [rentals, setRentals] = useState([]);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rentalLoading, setRentalLoading] = useState(false);
  const { user } = useAuth();

  const fetchRewardsAndRentals = async () => {
    setRentalLoading(true);
    try {
      const [userRes, rentalsRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/rentals/user"),
      ]);

      setRewardPoints(Number(userRes.data?.rewardPoints || 0));
      setRentals(rentalsRes?.data?.data || []);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setRentalLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsAndRentals();
  }, []);

  const rentalColumns = [
    {
      title: "SN. No.",
      dataIndex: "sn",
      render: (value, record, index) => index + 1,
    },
    {
      title: "Vehicle",
      key: "vehicleName",
      render: (_, record) => (
        <div className="flex items-center gap-2">{record.vehicle.name}</div>
      ),
    },
    {
      title: "Scheduled",
      dataIndex: "scheduleDate",
      key: "scheduleDate",
      render: (value) =>
        value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-",
    },
    {
      title: "Planned Km",
      dataIndex: "plannedKm",
      key: "plannedKm",
    },
    {
      title: "Extra Km",
      dataIndex: "extraKm",
      key: "extraKm",
      render: (value) => (value !== null && value !== undefined ? value : "-"),
    },
    {
      title: "Total",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (value) => (value ? Number(value).toFixed(2) : "0.00"),
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (value, record) => (
        <div className="flex items-center gap-2">{record.payment?.amount}</div>
      ),
    },
    {
      title: "Points Used",
      dataIndex: "rewardPointsUsed",
      key: "rewardPointsUsed",
      render: (value, record) => (
        <div className="flex items-center gap-2">
          {record.payment?.rewardPointsUsed}
        </div>
      ),
    },
    {
      title: "Points Earned",
      dataIndex: "rewardPointsEarned",
      key: "rewardPointsEarned",
      render: (value, record) => (
        <div className="flex items-center gap-2">
          {record.payment?.rewardPointsEarned}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={value === "completed" ? "green" : "blue"}>{value}</Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Space size="large" align="center">
          <div>
            <Text type="secondary">Reward points</Text>
            <Title level={3} style={{ margin: 0 }}>
              {rewardPoints}
            </Title>
          </div>
          <Text type="secondary">
            Earn points after each ride is completed can be payed at the end of
            ride
          </Text>
        </Space>
      </Card>

      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          Your rides
        </Title>
        <Table
          rowKey="id"
          loading={rentalLoading}
          columns={rentalColumns}
          dataSource={rentals}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </div>
  );
}
