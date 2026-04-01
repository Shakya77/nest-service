"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Typography,
  Upload,
  message,
  DatePicker,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function page() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("add");
  const [activeLeave, setActiveLeave] = useState(null);
  const [staff, setStaff] = useState([]);
  const [form] = Form.useForm();

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/leaves");
      setLeaves(data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data } = await api.get("/users/staff");
      setStaff(
        data.map((employee) => ({
          value: employee.id,
          label: `${employee.name} (${employee.email})`,
        })),
      );
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchStaff();
  }, []);

  const openCreate = () => {
    setMethod("add");
    setActiveLeave(null);
    form.resetFields();
    form.setFieldsValue({ isAvailable: true });
    setOpen(true);
  };

  const handleSubmit = async (fieldsValue) => {
    const values = {
      ...fieldsValue,
      fromDate: dayjs(fieldsValue.dateRange[0]).format("YYYY-MM-DD"),
      toDate: dayjs(fieldsValue.dateRange[1]).format("YYYY-MM-DD"),
      application: fieldsValue.application?.[0]?.originFileObj,
    };

    try {
      await api.post("/leaves", values, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      message.success("Leave created");
      setOpen(false);
      fetchLeaves();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "sn",
      key: "sn",
      render: (_, record, index) => index + 1,
    },
    {
      title: "employee name",
      dataIndex: "name",
      key: "name",
      render: (_, data) => {
        return `${data.name} ${data.email}`;
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (_, data) => {
        const from = new Date(data.fromDate);
        const to = new Date(data.toDate);

        const diffTime = to - from;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return `${diffDays} days`;
      },
    },
    {
      title: "From Date - To Date",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (_, data) => {
        return `${data.fromDate} - ${data.toDate}`;
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (value, record) => (
        <Space>
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
              Leaves
            </Title>
            <Text type="secondary">
              Manage leave requests and their statuses.
            </Text>
          </Col>

          <Col>
            <Button type="primary" onClick={openCreate}>
              Add Leave
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
          dataSource={leaves}
        />
      </Card>

      <Modal
        title={method === "edit" ? "Edit Leave" : "Add Leave"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={form.submit}
        okText={method === "edit" ? "Save" : "Create"}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ isAvailable: true }}
          encType="multipart/form-data"
        >
          <Form.Item
            label="Leave Title"
            name="name"
            rules={[{ required: true, message: "Enter a title" }]}
          >
            <Input placeholder="e.g. Sick Leave" />
          </Form.Item>

          <Form.Item
            name="staffId"
            label="Select Staff"
            rules={[{ required: true, message: "Enter a date range" }]}
          >
            <Select options={staff}></Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Leave Duration"
            rules={[{ required: true, message: "Enter a date range" }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            name="application"
            label="Upload Application"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload name="application" listType="picture">
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
