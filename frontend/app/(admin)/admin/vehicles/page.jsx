"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import api from "@/lib/api";
import Link from "next/link";

const { Title, Text } = Typography;

const availabilityColors = {
  true: "green",
  false: "red",
};

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [saving, setSaving] = useState(false);
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
    setEditingVehicle(null);
    form.resetFields();
    form.setFieldsValue({ isAvailable: true });
    setModalOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue({
      name: vehicle.name,
      registrationNo: vehicle.registrationNo,
      basePricePerKm: vehicle.basePricePerKm,
      isAvailable: Boolean(vehicle.isAvailable),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVehicle(null);
    form.resetFields();
  };

  const submitVehicle = async (values) => {
    setSaving(true);
    const payload = {
      ...values,
      basePricePerKm: Number(values.basePricePerKm),
      isAvailable: Boolean(values.isAvailable),
    };

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload);
        message.success("Vehicle updated");
      } else {
        await api.post("/vehicles", payload);
        message.success("Vehicle created");
      }

      closeModal();
      fetchVehicles();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
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

  const handleAvailabilityChange = async (record, checked) => {
    try {
      await api.put(`/vehicles/${record.id}`, {
        name: record.name,
        registrationNo: record.registrationNo,
        basePricePerKm: Number(record.basePricePerKm),
        isAvailable: checked,
      });
      message.success("Availability updated");
      fetchVehicles();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "sn",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Registration No.",
      dataIndex: "registrationNo",
      key: "registrationNo",
    },
    {
      title: "Base Price / Km",
      dataIndex: "basePricePerKm",
      key: "basePricePerKm",
      render: (value) => `Rs. ${Number(value || 0).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (value, record) => (
        <Space>
          <Tag color={availabilityColors[String(Boolean(value))]}>
            {value ? "Available" : "Unavailable"}
          </Tag>
          <Switch
            checked={Boolean(value)}
            checkedChildren="On"
            unCheckedChildren="Off"
            onChange={(checked) => handleAvailabilityChange(record, checked)}
          />
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
            <Popconfirm
              title="Delete this vehicle?"
              description="This action cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
          <Link href={`/admin/vehicles/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} />
          </Link>
        </>
      ),
    },
  ];

  return (
    <>
      <Card
        loading={loading}
        title={
          <Space>
            <Title level={3}>Vehicles</Title>
            <Text type="secondary">
              (Create, update, delete, and toggle vehicle availability.)
            </Text>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Vehicle
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={vehicles}
        />
      </Card>

      <Modal
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={form.submit}
        okText={editingVehicle ? "Save" : "Create"}
        confirmLoading={saving}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submitVehicle}
          initialValues={{ isAvailable: true }}
        >
          <Form.Item
            label="Vehicle Name"
            name="name"
            rules={[{ required: true, message: "Enter a vehicle name" }]}
          >
            <Input placeholder="e.g. Toyota Hiace" />
          </Form.Item>

          <Form.Item
            label="Registration No."
            name="registrationNo"
            rules={[{ required: true, message: "Enter a registration number" }]}
          >
            <Input placeholder="e.g. BA 2 KHA 1234" />
          </Form.Item>

          <Form.Item
            label="Base Price Per Km"
            name="basePricePerKm"
            rules={[{ required: true, message: "Enter the base price per km" }]}
          >
            <InputNumber
              min={0}
              step={1}
              style={{ width: "100%" }}
              placeholder="e.g. 100"
            />
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
    </>
  );
}
