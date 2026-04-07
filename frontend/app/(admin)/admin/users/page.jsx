"use client";

import { useState } from "react";
import {
  Col,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import api from "@/lib/api";
import useSWR from "swr";
import { fetcher, Roles } from "@/constants";

const { Title, Text } = Typography;

const ROLE_COLORS = {
  admin: "gold",
  staff: "blue",
  client: "green",
};

export default function page() {
  const [roleFilter, setRoleFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = `/users?page=${page}&limit=${pageSize}${roleFilter ? `&role=${roleFilter}` : ""}`;
  const { data, isLoading, mutate } = useSWR(query, fetcher);

  const changeStatus = async (id, role, checked) => {
    console.log(id, role, checked);
    try {
      await api.patch(`/users/${role}/${id}`, { isActive: checked });
      message.success("Status updated");
      mutate();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      title: "SN",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (value) => (
        <Tag color={ROLE_COLORS[value] || "default"}>{value}</Tag>
      ),
    },
    {
      title: "Reward Points",
      dataIndex: "rewardPoints",
      render: (value, record) => {
        if (record.role === Roles.USER) {
          return value;
        }
        return "-";
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <Switch
          checked={row.isActive}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => changeStatus(row.id, row.role, checked)}
        />
      ),
    },
  ];

  return (
    <Row>
      <Col span={24}>
        <Title level={3} style={{ marginBottom: 4 }}>
          Users
        </Title>
        <Text type="secondary">Manage staff, admins, and client profiles.</Text>
      </Col>

      <Col span={24} style={{ marginTop: 16 }}>
        <Space className="mb-8">
          <span>Filter By Role</span>
          <Select
            allowClear
            style={{ width: 120 }}
            onChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            options={[
              { label: "Staff", value: "staff" },
              { label: "User", value: "user" },
            ]}
          />
        </Space>

        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          scroll={{ x: "max-content" }}
          dataSource={data?.data || []}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["1", "10", "20", "50"],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
            showTotal: (total, range) => {
              return `Total ${total} records | Showing ${range[0]}-${range[1]}`;
            },
          }}
        />
      </Col>
    </Row>
  );
}
