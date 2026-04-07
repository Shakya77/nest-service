"use client";

import Link from "next/link";
import { Button, Card, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import api from "@/lib/api";

const { Title, Text } = Typography;

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/vehicles/available");
      setVehicles(data.map((v) => ({ label: v.name, value: v.id })));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <Card className="border border-slate-200" variant="borderless">
          <Space orientation="vertical" size={8} style={{ width: "100%" }}>
            <Text type="secondary" style={{ textTransform: "uppercase" }}>
              Service Hub
            </Text>
            <Title level={2} style={{ margin: 0 }}>
              Run rentals with clarity.
            </Title>
            <Text type="secondary">
              One place to handle staff, clients, and vehicle workflows.
            </Text>
            <Space wrap style={{ marginTop: 8 }}>
              <Link href="/login">
                <Button type="primary">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button type="default">Register</Button>
              </Link>
            </Space>
          </Space>
        </Card>
        <Title level={3}>Available Vehicle an there Calender</Title>
        <Select
          options={vehicles}
          style={{ width: "20%" }}
          value={selectedVehicle}
          onChange={setSelectedVehicle}
        />
      </div>
    </main>
  );
}
