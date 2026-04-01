"use client";

import { useEffect, useState } from "react";
import { Card, Space, Typography, message } from "antd";
import api from "@/lib/api";

const { Title, Text } = Typography;

export default function page() {
  const [stats, setStats] = useState({
    mostBookedVehicle: null,
    mostWorkingStaff: null,
    todaysIncome: null,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rentals/stats");
      setStats({
        mostBookedVehicle: data?.mostBookedVehicle || null,
        mostWorkingStaff: data?.mostWorkingStaff || null,
        todaysIncome: data?.todaysIncome || null,
      });
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const bookedVehicle = stats.mostBookedVehicle;
  const workingStaff = stats.mostWorkingStaff;

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
            <Title level={4} style={{ margin: 0 }}>
              {bookedVehicle?.name}
            </Title>
            <Text type="secondary">
              {bookedVehicle ? `${bookedVehicle.totalBookings} bookings` : ""}
            </Text>
          </Space>
        </Card>
        <Card loading={loading}>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">Most working employee</Text>
            <Title level={4} style={{ margin: 0 }}>
              {workingStaff?.name}
            </Title>
            <Text type="secondary">
              {workingStaff
                ? `${Number(workingStaff.totalHours || 0).toFixed(2)} hours`
                : ""}
            </Text>
          </Space>
        </Card>
        <Card loading={loading}>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">Today's Income</Text>
            <Title level={4} style={{ margin: 0 }}>
              Rs. {Number(stats.todaysIncome?.totalIncome || 0).toFixed(2)}
            </Title>
          </Space>
        </Card>
      </div>
    </div>
  );
}
