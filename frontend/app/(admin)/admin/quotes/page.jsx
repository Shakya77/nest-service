"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Flex,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import api from "@/lib/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusColors = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export default function page() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffOptions, setStaffOptions] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningQuote, setAssigningQuote] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/quotes/admin");
      setQuotes(data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get("/users/staff");
      setStaffOptions(
        data.map((staff) => ({
          value: staff.user?.id,
          label: `${staff.name} (${staff.email})`,
        })),
      );
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const updateStatus = async (id, status, staffId) => {
    try {
      await api.patch(`/quotes/${id}/status`, { status, staffId });
      await fetchQuotes();
      message.success("Status updated");
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const confirmStatusChange = (record, nextStatus) => {
    if (record.status === nextStatus) return;
    if (nextStatus === "approved") {
      setAssigningQuote(record);
      setSelectedStaff(null);
      setAssignModalOpen(true);
      return;
    }
    console.log(record);
    Modal.confirm({
      title: "Confirm status change",
      content: `Change status from ${record.status} to ${nextStatus}?`,
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => updateStatus(record.id, nextStatus),
    });
  };

  const handleAssignConfirm = async () => {
    if (!assigningQuote) return;
    if (!selectedStaff) {
      message.error("Select a staff member");
      return;
    }
    await updateStatus(assigningQuote.id, "approved", selectedStaff);
    setAssignModalOpen(false);
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "sn",
      key: "sn",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      render: (_, record) => (
        <div>
          <div>{record.client?.name}</div>
          <Text type="secondary">{record.client?.email}</Text>
        </div>
      ),
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleName",
      key: "vehicleName",
      render: (_, record) => (
        <div>
          <div>{record.vehicles?.name}</div>
          <Text type="secondary">{record.vehicles?.registrationNo}</Text>
        </div>
      ),
    },
    {
      title: "Requested Km",
      dataIndex: "requestedKm",
      key: "requestedKm",
    },
    {
      title: "Estimated Price",
      dataIndex: "estimatedPrice",
      key: "estimatedPrice",
      render: (value) => Number(value).toFixed(2),
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (value) => value && dayjs(value).format("MMM D, YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value, record) => (
        <Select
          size="small"
          value={value}
          disabled={
            record.status === "approved" || record.status === "rejected"
          }
          onChange={(nextStatus) => confirmStatusChange(record, nextStatus)}
          options={statusOptions}
          style={{ minWidth: 120 }}
        />
      ),
    },
    {
      title: "State",
      key: "statusTag",
      render: (_, record) => (
        <Tag color={statusColors[record.status] || "blue"}>{record.status}</Tag>
      ),
    },
  ];
  console.log(staffOptions);
  return (
    <>
      <Row gutter={[20,20]}>
        <Col span={20} justify="start" align="left">
          <Title level={3}>Quotes</Title>
          <Text type="secondary">
            (Approve, reject, and track pending quote requests.)
          </Text>
        </Col>
        <Col span={4} justify="end" align="right">
          <Button onClick={() => fetchQuotes()} className="mt-4">
            Refresh
          </Button>
        </Col>

        <Col span={24}>
          <Table
            rowKey="id"
            loading={loading}
            scroll={{ x: "max-content" }}
            columns={columns}
            dataSource={quotes}
          />
        </Col>
      </Row>

      <Modal
        title="Assign staff member"
        open={assignModalOpen}
        onOk={handleAssignConfirm}
        onCancel={() => setAssignModalOpen(false)}
        okText="Assign & Approve"
      >
        <Select
          placeholder="Select staff"
          value={selectedStaff}
          onChange={setSelectedStaff}
          options={staffOptions}
          style={{ width: "100%" }}
        />
      </Modal>
    </>
  );
}
