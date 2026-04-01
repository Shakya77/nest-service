"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Col,
  InputNumber,
  Modal,
  Row,
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
  const [extraKm, setExtraKm] = useState(0);
  const [activeRental, setActiveRental] = useState(null);
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
      await api.post(`/rentals/${rentalId}/start`);
      message.success("Rental started");
      await fetchRentals();
    } catch (err) {
      message.error("Failed to start rental");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async (rentalId) => {
    setActionLoading(true);
    try {
      await api.post(`/rentals/${rentalId}/end`, {
        rewardPointsUsed,
        paymentMethod,
      });
      message.success("Rental completed");
      await fetchRentals();
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to complete rental",
      );
    } finally {
      setActionLoading(false);
      setEndModalOpen(false);
    }
  };

  const openExtraModal = (rental) => {
    setActiveRental(rental);
    setExtraKm(0);
    setExtraModalOpen(true);
  };

  const openEndModal = (rental) => {
    setEndingRental(rental);
    setRewardPointsUsed(0);
    setPaymentMethod("cash");
    setEndModalOpen(true);
  };

  const handleExtraSubmit = async () => {
    if (!activeRental) return;
    if (!extraKm || Number(extraKm) <= 0) {
      message.error("Extra km must be greater than 0");
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/rentals/${activeRental.id}/extra`, { addedKm: extraKm });
      message.success("Extra km logged");
      setExtraModalOpen(false);
      await fetchRentals();
    } catch (err) {
      message.error("Failed to log extra km");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
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
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Staff Dashboard</Title>
            <Text type="secondary">
              Review assigned rentals, start/end trips, and log extra distance.
            </Text>
          </Col>
          <Col>
            <div style={{ marginTop: 16 }}>
              <Button onClick={fetchRentals}>Refresh</Button>
            </div>
          </Col>
        </Row>
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
        title="Log Extra Distance"
        open={extraModalOpen}
        onOk={handleExtraSubmit}
        onCancel={() => setExtraModalOpen(false)}
        okButtonProps={{ loading: actionLoading }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Text>Extra kilometers driven for this rental.</Text>
          <InputNumber
            min={1}
            value={extraKm}
            onChange={setExtraKm}
            style={{ width: "100%" }}
          />
        </div>
      </Modal>

      <Modal
        title="Complete Rental"
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
            <Text>Reward points to use</Text>
            <InputNumber
              min={0}
              max={Number(endingRental?.clientRewardPoints ?? 0)}
              value={rewardPointsUsed}
              onChange={setRewardPointsUsed}
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
