"use client";

import { fetcher } from "@/constants";
import { Card, Space, Table, Typography } from "antd";
import { useParams } from "next/navigation";
import useSWR from "swr";

const { Title } = Typography;

export default function page() {
  const { id } = useParams();
  const query = `/vehicles/${id}/bookings`;
  const { data: swrData, isLoading, mutate } = useSWR(query, fetcher);

  const vehicleQuery = `/vehicles/${id}`;
  const { data: vehicleData, isLoading: isVehicleLoading } = useSWR(
    vehicleQuery,
    fetcher,
  );

  const columns = [
    {
      title: "SN",
      dataIndex: "id",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Client",
      dataIndex: "user",
      render: (_, record) => (
        <div>
          <div>{record.user?.name}</div>
          <div>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Staff",
      dataIndex: "staff",
      render: (_, record) => (
        <div>
          <div>{record.staff?.name}</div>
          <div>{record.staff?.email}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => (
        <div>
          <div>{value}</div>
        </div>
      ),
    },
    {
      title: "Scheduled",
      dataIndex: "scheduleDate",
      render: (value) => (value ? new Date(value).toLocaleString() : null),
    },
    {
      title: "Total Cost",
      dataIndex: "totalPrice",
      render: (value) => (value ? `Rs. ${value}` : "0.00"),
    },
    {
      title: "Planned Km",
      dataIndex: "plannedKm",
    },
    {
      title: "Planned Cost",
      dataIndex: "totalCost",
      render: (value) => (value ? `Rs. ${value}` : "0.00"),
    },
    {
      title: "Extra Km",
      dataIndex: "extraKm",
    },
  ];

  return (
    <Card>
      <Title level={3}>Bookings of the vehicle {vehicleData?.name}</Title>

      <Table
        rowKey="id"
        loading={isLoading}
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={swrData || []}
      />
    </Card>
  );
}
