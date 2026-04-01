"use client";

import { Button, Modal, Typography, theme } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Header } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const { Text } = Typography;

export default function DashboardHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [loading, user, router]);

  return (
    <Header
      style={{
        background: colorBgContainer,
        display: "flex",
        flexDirection: "row-reverse",
        alignItems: "center",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "flex-end",
        }}
      >
        <div>
          <Text type="secondary">{user?.email || "email not available"}</Text>
          <Text type="secondary">
            {user?.role ? ` (${user.role})` : " Guest"}
          </Text>
        </div>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Logout
        </Button>
      </div>

      <Modal
        title="Are you sure you want to logout?"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="logout" type="primary" danger onClick={handleLogout}>
            Yes, Logout
          </Button>,
        ]}
      />
    </Header>
  );
}
