"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import api from "../../../lib/api";

const { Title, Text } = Typography;

const statusColor = {
  assigned: "blue",
  in_progress: "gold",
  completed: "green",
};

export default function page() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [activeRental, setActiveRental] = useState(null);
  const [extraKm, setExtraKm] = useState(0);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [endingRental, setEndingRental] = useState(null);
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rentals/staff");
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

  const handleStart = async (rentalId) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/rentals/${rentalId}/start`);
      message.success(data?.message || "Rental started");
      await fetchRentals();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to start rental");
    } finally {
      setActionLoading(false);
    }
  };

  const openEndModal = (rental) => {
    setEndingRental(rental);
    setRewardPointsUsed(0);
    setPaymentMethod("cash");
    setEndModalOpen(true);
  };

  const handleEnd = async (rentalId) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/rentals/${rentalId}/end`, {
        rewardPointsUsed: Number(rewardPointsUsed || 0),
        paymentMethod,
      });
      message.success(data?.message || "Rental completed");
      setEndModalOpen(false);
      await fetchRentals();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to end rental");
    } finally {
      setActionLoading(false);
    }
  };

  const openExtraModal = (rental) => {
    setActiveRental(rental);
    setExtraKm(0);
    setExtraModalOpen(true);
  };

  const submitExtraKm = async () => {
    if (!activeRental) return;
    if (!extraKm || Number(extraKm) <= 0) {
      message.error("Extra km must be greater than 0");
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await api.post(`/rentals/${activeRental.id}/extra`, {
        addedKm: Number(extraKm),
      });
      message.success(data?.message || "Extra km added");
      setExtraModalOpen(false);
      await fetchRentals();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to add extra km");
    } finally {
      setActionLoading(false);
    }
  };

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
      title: "Scheduled",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
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
    },
    {
      title: "Total",
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            disabled={record.status !== "assigned"}
            loading={actionLoading}
            onClick={() => handleStart(record.id)}
          >
            Start
          </Button>
          <Button
            size="small"
            disabled={record.status !== "in_progress"}
            loading={actionLoading}
            onClick={() => openEndModal(record)}
          >
            End
          </Button>
          <Button
            size="small"
            disabled={record.status === "completed"}
            loading={actionLoading}
            onClick={() => openExtraModal(record)}
          >
            Add Extra Km
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Space
          style={{ width: "100%", justifyContent: "space-between" }}
          align="start"
        >
          <div>
            <Title level={3}>Staff Dashboard</Title>
            <Text type="secondary">Simple list of your assigned rentals.</Text>
          </div>
          <Button onClick={fetchRentals}>Refresh</Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rentals}
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="Add Extra Km"
        open={extraModalOpen}
        onOk={submitExtraKm}
        onCancel={() => setExtraModalOpen(false)}
        okButtonProps={{ loading: actionLoading }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text>Enter additional kilometers for this ride.</Text>
          <InputNumber
            min={1}
            value={extraKm}
            onChange={setExtraKm}
            style={{ width: "100%" }}
          />
        </div>
      </Modal>

      <Modal
        title="End Ride"
        open={endModalOpen}
        onOk={() => endingRental && handleEnd(endingRental.id)}
        onCancel={() => setEndModalOpen(false)}
        okButtonProps={{ loading: actionLoading }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Text>
            Available reward points: {endingRental?.clientRewardPoints ?? 0}
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>Reward points used</Text>
            <InputNumber
              min={0}
              max={Number(endingRental?.clientRewardPoints ?? 0)}
              value={rewardPointsUsed}
              onChange={(value) => setRewardPointsUsed(value || 0)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>Payment method</Text>
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "wallet", label: "Wallet" },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
