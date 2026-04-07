"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import api from "@/lib/api";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function page() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();
  const [method, setMethod] = useState("add");
  const [id, setId] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/staff");
      setStaff(data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span>{record.user.name}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span>{record.user.email}</span>
        </div>
      ),
    },
    {
      title: "Hourly Rate",
      dataIndex: "ratePerHr",
      key: "ratePerHr",
      render: (value) => {
        return `Rs. ${Number(value || 0).toFixed(2)}`;
      },
    },
    {
      title: "Total Hours",
      dataIndex: "totalHours",
      key: "totalHours",
      render: (value) => {
        return Number(value || 0).toFixed(2);
      },
    },
    {
      title: "Total Income",
      dataIndex: "totalIncome",
      key: "totalIncome",
      render: (value) => {
        return `Rs. ${Number(value || 0).toFixed(2)}`;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (value, record) => (
        <Tag color={record.user.isActive ? "green" : "red"}>
          {record.user.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record.user.id)}
          />
          <Popconfirm
            title="Delete this staff?"
            onConfirm={() => handleDelete(record.user.id)}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCancel = () => {
    setModal(false);
  };

  const onSubmit = async (values) => {
    try {
      if (method === "edit") {
        await api.patch(`/users/staff/${id}`, values);
        message.success("Staff updated");
      }

      if (method === "add") {
        await api.post("/users/staff", values);
        message.success("Staff created");
      }

      setModal(false);
      fetchStaff();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const openModal = () => {
    setModal(true);
    setMethod("add");
    form.resetFields();
  };

  const openEdit = async (id) => {
    console.log(id);
    setModal(true);
    setMethod("edit");
    setId(id);
    const { data } = await api.get(`/users/staff/${id}`);
    form.setFieldsValue(data);
  };

  const handleDelete = async (id) => {
    try {
      const result = await api.delete(`/users/staff/${id}`);

      message.success("Staff deleted");
      fetchStaff();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col span={20} justify="start" align="left">
          <Title level={3}>Staff Profiles</Title>
          <Text type="secondary">
            (Track staff hours worked and estimated income.)
          </Text>
        </Col>
        <Col span={4} justify="end" align="right">
          <Button type="primary" onClick={openModal}>
            Add Staff
          </Button>
        </Col>
        <Col span={24}>
          <Table
            rowKey="id"
            scroll={{ x: "max-content" }}
            loading={loading}
            columns={columns}
            dataSource={staff}
          />
        </Col>
      </Row>

      <Modal
        title="Crate staff"
        closable={{ "aria-label": "Custom Close Button" }}
        open={modal}
        onOk={() => {
          form.submit();
        }}
        onCancel={handleCancel}
      >
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item
            label="Full name"
            name="name"
            rules={[{ required: true, min: 2 }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Divider />
          <Form.Item label="Hourly rate" name="ratePerHr">
            <Input size="large" />
          </Form.Item>
          <Form.Item label="License number" name="licenseNumber">
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[method === "edit" ? null : { required: true, min: 6 }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label="Confirm password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              method === "edit" ? null : { required: true, min: 6 },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
