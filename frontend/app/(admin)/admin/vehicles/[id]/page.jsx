"use client";

import { fetcher } from "@/constants";
import api from "@/lib/api";
import { Calendar, Card, Flex, Space, Table, Typography } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const { Title } = Typography;

export default function page() {
  const { id } = useParams();
  const [disabledDates, setDisabledDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = `/vehicles/${id}/bookings`;
  const { data: swrData, isLoading, mutate } = useSWR(query, fetcher);

  const vehicleQuery = `/vehicles/${id}`;
  const { data: vehicleData, isLoading: isVehicleLoading } = useSWR(
    vehicleQuery,
    fetcher,
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/vehicles/${id}/disable-dates`);
      setDisabledDates(response?.data || []);
    } catch (error) {
      console.error("Error fetching disable dates:", error);
      setDisabledDates([]);
    } finally {
      setLoading(false);
    }
  };

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
      render: (value) => value || "0",
    },
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  const isDateDisabled = (current) => {
    const formatted = current ? current.format("YYYY-MM-DD") : "";
    return !!formatted && disabledDates.includes(formatted);
  };

  return (
    <Flex vertical gap={6}>
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

      <Card>
        <Title level={3}>Calender of the vehicle {vehicleData?.name}</Title>

        <Flex align="center" gap={12}>
          <span className="w-10 h-10 bg-gray-300 block"></span>
          <p>Highlited dates are disabled</p>
        </Flex>

        <Calendar fullscreen={false} showWeek disabledDate={isDateDisabled} />
      </Card>
    </Flex>
  );
}
