"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Divider, Form, Input, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import { dashboardForRole, useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      router.push(dashboardForRole(user.role, user.slug));
    }
  }, [authLoading, user, router]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", values);

      if (data?.token) {
        const decoded = login(data.token);
        const role = decoded?.role;
        router.push(dashboardForRole(role));
      } else {
        router.push("/");
      }

      message.success("Welcome back!");
      form.resetFields();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2} style={{ marginBottom: 4 }}>
            Welcome back
          </Title>
          <Text type="secondary">Sign in to continue.</Text>
        </div>

        <Card className="border border-slate-200" variant="borderless">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input size="large" prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} />
            </Form.Item>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              block
              className="rounded-md"
            >
              Sign in
            </Button>
          </Form>

          <Divider style={{ margin: "20px 0" }} />
          <div className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link className="font-medium" href="/register">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
