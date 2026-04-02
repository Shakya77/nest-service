"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import api from "@/lib/api";
import dayjs from "dayjs";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import Ticket from "@/components/Ticket";

const { Title, Text } = Typography;

const statusColors = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export default function page() {
  const [vehicles, setVehicles] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [method, setMethod] = useState("add");
  const [activeQuote, setActiveQuote] = useState(null);
  const [disabledDates, setDisabledDates] = useState([]);
  const [form] = Form.useForm();

  const vehicleId = Form.useWatch("vehicleId", form);
  const requestedKm = Form.useWatch("requestedKm", form);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const estimatedPrice = selectedVehicle
    ? Number(requestedKm || 0) * Number(selectedVehicle.basePricePerKm)
    : 0;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, quotesRes] = await Promise.all([
        api.get("/vehicles/available"),
        api.get("/quotes/client"),
      ]);
      setVehicles(vehiclesRes.data);
      setQuotes(quotesRes.data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log(vehicles, quotes);
  useEffect(() => {
    const fetchDisabledDates = async () => {
      if (!vehicleId) {
        setDisabledDates([]);
        return;
      }

      try {
        const { data } = await api.get(`/vehicles/${vehicleId}/disable-dates`);
        setDisabledDates(
          Array.isArray(data)
            ? data.map((date) => dayjs(date).format("YYYY-MM-DD"))
            : [],
        );
      } catch (err) {
        message.error(err?.response?.data?.message || err.message);
      }
    };

    fetchDisabledDates();
  }, [vehicleId]);

  const openCreate = () => {
    setMethod("add");
    setActiveQuote(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = async (record) => {
    setMethod("edit");
    setActiveQuote(record);
    try {
      const { data } = await api.get(`/quotes/${record.id}`);
      form.setFieldsValue({
        vehicleId: data.vehicleId,
        requestedKm: data.requestedKm,
        bookingDate: data.bookingDate ? dayjs(data.bookingDate) : null,
        pickupLocation: data.pickupLocation || "",
      });
      setModalOpen(true);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        bookingDate: values.bookingDate
          ? values.bookingDate.format("YYYY-MM-DD")
          : null,
      };
      if (method === "edit" && activeQuote) {
        await api.put(`/quotes/${activeQuote.id}`, payload);
        message.success("Quote updated");
      } else {
        await api.post("/quotes", payload);
        message.success("Quote created");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/quotes/${id}`);
      message.success("Quote deleted");
      fetchData();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      title: "Vehicle",
      dataIndex: "vehicleName",
      key: "vehicleName",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={statusColors[value] || "blue"}>{value}</Tag>
      ),
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (value) => value && dayjs(value).format("MMM D, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link href={`/client/quote-details/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} />
          </Link>
          {record.status === "pending" && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                disabled={record.status !== "pending"}
                onClick={() => openEdit(record)}
              />
              <Popconfirm
                title="Delete this quote?"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  disabled={record.status !== "pending"}
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4 }}>
              Book a Ride
            </Title>
            <Text type="secondary">Create and track your rides.</Text>
          </Col>

          <Col>
            <Button type="primary" onClick={openCreate}>
              Create ride
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={quotes}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Ticket />

      <Modal
        title={method === "edit" ? "Edit quote" : "New quote"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={method === "edit" ? "Save" : "Create"}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Vehicle"
            name="vehicleId"
            rules={[{ required: true, message: "Select a vehicle" }]}
          >
            <Select
              placeholder="Select vehicle"
              options={vehicles.map((vehicle) => ({
                value: vehicle.id,
                label: `${vehicle.name} (Rs.${vehicle.basePricePerKm}/km)`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Requested Km"
            name="requestedKm"
            rules={[{ required: true, message: "Enter requested Km" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              max={50}
              placeholder="min is 1 max is 50"
            />
          </Form.Item>

          <Form.Item
            label="Booking date"
            name="bookingDate"
            rules={[{ required: true, message: "Select a booking date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) => {
                const formatted = current ? current.format("YYYY-MM-DD") : "";
                if (formatted && disabledDates.includes(formatted)) {
                  return true;
                }
                return (
                  current && current < dayjs().add(2, "day").startOf("day")
                );
              }}
            />
          </Form.Item>
          <Form.Item
            label="Pickup location"
            name="pickupLocation"
            rules={[{ required: true, message: "Enter pickup location" }]}
          >
            <Input placeholder="Enter pickup location" />
          </Form.Item>

          <Card size="small">
            <Text type="secondary">Estimated price</Text>
            <Title level={4} style={{ margin: "4px 0 0" }}>
              {Number(estimatedPrice).toFixed(2)}
            </Title>
            <Text type="secondary">
              Based on selected vehicle and distance.
            </Text>
          </Card>
        </Form>
      </Modal>
    </div>
  );
}
