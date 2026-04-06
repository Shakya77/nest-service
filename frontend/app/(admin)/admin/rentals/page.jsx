"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import useSWR from "swr";
import { fetcher } from "@/constants";
import api from "@/lib/api";

const { Title, Text } = Typography;

const statusColor = {
  assigned: "blue",
  in_progress: "gold",
  completed: "green",
};

export default function page() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const query = `/rentals?page=${page}&limit=${pageSize}`;
  const { data, isLoading, mutate } = useSWR(query, fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const clients = `/users/customer`;
  const {
    data: clientsData,
    isLoading: isClientsLoading,
    mutate: mutateClients,
  } = useSWR(clients, fetcher);

  const distanceLogs = (id) => {
    setLoading(true);
    const query = `/rentals/${id}/distance-logs`;
    const { data, isLoading } = api.get(query).then((res) => {
      setLogs(res.data);
      setLoading(false);
      showModal();
    });

    return { distanceLogs: data || [], isDistanceLogsLoading: isLoading };
  };

  const logColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Added Km", dataIndex: "addedKm", key: "addedKm" },
    {
      title: "Added At",
      dataIndex: "addedAt",
      key: "addedAt",
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  const columns = [
    {
      title: "SN",
      dataIndex: "id",
      render: (_, __, index) => {
        return index + 1;
      },
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleName",
      render: (_, record) => (
        <div>
          <div>{record.vehicle.name}</div>
          <Text type="secondary">{record.vehicle.registrationNo}</Text>
        </div>
      ),
    },
    {
      title: "Client",
      dataIndex: "clientName",
      render: (_, record) => (
        <div>
          <div>{record.quote.client.name}</div>
          <Text type="secondary">{record.quote.client.email}</Text>
        </div>
      ),
    },
    {
      title: "Staff",
      dataIndex: "staffName",
      key: "staffName",
      render: (value, record) => record.staff.name || "Not assigned",
    },
    {
      title: "Scheduled",
      dataIndex: "scheduleDate",
      key: "scheduleDate",
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
    {
      title: "Distance Logs",
      dataIndex: "distanceLogs",
      key: "distanceLogs",
      render: (_, record) => (
        <Button onClick={() => distanceLogs(record.id)}>View</Button>
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
          <Button onClick={() => mutate()}>Refresh</Button>
        </Space>
      </Card>
      <Card variant="borderless">
        <Select
          allowClear
          loading={isClientsLoading}
          onChange={(value) => {}}
          options={clientsData?.map((client) => ({
            label: client.name,
            value: client.id,
          }))}
          placeholder="Filter by user"
        ></Select>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize,
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["4", "10", "20", "50"],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
            showTotal: (total, range) => {
              return `Total ${total} records | Showing ${range[0]}-${range[1]}`;
            },
          }}
        />
      </Card>

      <Modal
        title="Rental Logs Modal"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Table
          columns={logColumns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={false}
        />{" "}
      </Modal>
    </div>
  );
}
