"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Select,
  Typography,
  message,
} from "antd";
import api from "@/lib/api";
import { dashboardForRole, useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;
const roleOptions = [
  { value: "user", label: "user" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const role = Form.useWatch("role", form);
  const { login, user, loading: authLoading } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = values;
      const { data } = await api.post("/auth/register", payload);

      if (data?.token) {
        const decoded = login(data.token);
        const nextRole = decoded?.role || data?.user?.role;
        if (nextRole) {
          window.location.href = dashboardForRole(nextRole);
          return;
        }
      }

      message.success("Account created");
      form.resetFields();
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      window.location.replace(dashboardForRole(user.role));
    }
  }, [authLoading, user]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2} style={{ marginBottom: 4 }}>
            Create your account
          </Title>
          <Text type="secondary">Set up your profile in minutes.</Text>
        </div>

        <Card className="border border-slate-200" variant="borderless">
          <Form layout="vertical" form={form} onFinish={onFinish}>
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

            <Form.Item label="Role" name="role" rules={[{ required: true }]}>
              <Select size="large" options={roleOptions} />
            </Form.Item>

            {role === "staff" ? (
              <>
                <Divider />
                <Form.Item label="Hourly rate" name="ratePerHr">
                  <Input size="large" />
                </Form.Item>
                <Form.Item label="License number" name="licenseNumber">
                  <Input size="large" />
                </Form.Item>
              </>
            ) : null}

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password size="large" />
            </Form.Item>

            <Form.Item
              label="Confirm password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, min: 6 },
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

            <div className="mt-4 grid gap-3">
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                block
                className="rounded-md"
              >
                Create account
              </Button>
            </div>
          </Form>

          <Divider style={{ margin: "20px 0" }} />
          <div className="text-center text-sm text-slate-500">
            Already have access?{" "}
            <Link className="font-medium" href="/login">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
