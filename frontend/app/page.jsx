"use client";

import Link from "next/link";
import { Button, Calendar, Card, Select, Space, Typography } from "antd";
import { useState } from "react";
import Loader from "@/components/Loader";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/constants";
import { useAuth } from "./context/AuthContext";

const { Title, Text } = Typography;

export default function Home() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { user } = useAuth();
  const {
    data: vehiclesData,
    error: vehiclesError,
    isLoading: vehiclesLoading,
  } = useSWR("/vehicles/available", fetcher);

  const vehicles =
    vehiclesData?.map((v) => ({ label: v.name, value: v.id })) || [];

  const {
    data: disabledDates = [],
    error: disabledDatesError,
    isLoading: disabledDatesLoading,
  } = useSWR(
    selectedVehicle ? `/vehicles/${selectedVehicle}/disable-dates` : null,
    fetcher,
  );
  if (vehiclesLoading) {
    return <Loader />;
  }

  const isDateDisabled = (current) => {
    const formatted = current ? current.format("YYYY-MM-DD") : "";
    return !!formatted && disabledDates.includes(formatted);
  };
  console.log(user);
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
            {!user && (
              <Space wrap style={{ marginTop: 8 }}>
                <Link href="/login">
                  <Button type="primary">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button type="default">Register</Button>
                </Link>
              </Space>
            )}

            {user && (
              <>
                <Text type="success">Logged in </Text>
                <Link href="/client/quotes">
                  <Button type="primary">Book a Ride</Button>
                </Link>
              </>
            )}
          </Space>
        </Card>
        <Title level={3}>Available Vehicle an there Calender</Title>
        <Select
          options={vehicles}
          style={{ width: "20%" }}
          value={selectedVehicle}
          allowClear
          onChange={(value) => setSelectedVehicle(value)}
        />
        {selectedVehicle && (
          <>
            <Calendar
              fullscreen={false}
              showWeek
              disabledDate={isDateDisabled}
            />

            <Text>
              Selected Vehicle:{" "}
              {vehiclesData?.find((v) => v.id === selectedVehicle)?.name}
            </Text>
          </>
        )}
      </div>
    </main>
  );
}
