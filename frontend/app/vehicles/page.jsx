"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import Link from "next/link";

const { Title, Text } = Typography;

export default function page() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("add");
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [form] = Form.useForm();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/vehicles");
      setVehicles(data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openCreate = () => {
    setMethod("add");
    setActiveVehicle(null);
    form.resetFields();
    form.setFieldsValue({ isAvailable: true });
    setOpen(true);
  };

  const openEdit = async (record) => {
    setMethod("edit");
    setActiveVehicle(record);
    try {
      const { data } = await api.get(`/vehicles/${record.id}`);
      form.setFieldsValue({
        name: data.name,
        basePricePerKm: Number(data.basePricePerKm),
        registrationNo: data.registrationNo,
        isAvailable: data.isAvailable,
      });
      setOpen(true);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (method === "edit" && activeVehicle) {
        await api.put(`/vehicles/${activeVehicle.id}`, values);
        message.success("Vehicle updated");
      } else {
        await api.post("/vehicles", values);
        message.success("Vehicle created");
      }
      setOpen(false);
      fetchVehicles();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      message.success("Vehicle deleted");
      fetchVehicles();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const handleAvailabilityChange = async (id, checked) => {
    try {
      await api.patch(`/vehicles/${id}`, { isAvailable: checked });
      await fetchVehicles();
      message.success("Availability updated");
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Registration",
      dataIndex: "registrationNo",
      key: "registrationNo",
      render: (_, record) => record.registrationno ?? record.registrationNo,
    },
    {
      title: "Base Price / Km",
      dataIndex: "basePricePerKm",
      key: "basePricePerKm",
      render: (_, record) => record.basepriceperkm ?? record.basePricePerKm,
    },
    {
      title: "Availability",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (_, record) => (
        <Switch
          checked={record.isAvailable}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => handleAvailabilityChange(record.id, checked)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this vehicle?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
          <Link href={`/admin/vehicles/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} />
          </Link>
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
              Vehicles
            </Title>
            <Text type="secondary">
              Review availability, pricing, and fleet status.
            </Text>
          </Col>

          <Col>
            <Button type="primary" onClick={openCreate}>
              Add Vehicle
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={vehicles}
        />
      </Card>

      <Modal
        title={method === "edit" ? "Edit vehicle" : "Add vehicle"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText={method === "edit" ? "Save" : "Create"}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isAvailable: true }}
        >
          <Form.Item
            label="Vehicle name"
            name="name"
            rules={[{ required: true, message: "Enter a name" }]}
          >
            <Input placeholder="e.g. Sprinter Van" />
          </Form.Item>
          <Form.Item
            label="Registration number"
            name="registrationNo"
            rules={[{ required: true, message: "Enter registration number" }]}
          >
            <Input placeholder="ABC-1234" />
          </Form.Item>
          <Form.Item
            label="Base price per km"
            name="basePricePerKm"
            rules={[{ required: true, message: "Enter base price" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={0.5} />
          </Form.Item>
          <Form.Item
            label="Available"
            name="isAvailable"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
