"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DesktopOutlined,
  FileOutlined,
  FileTextOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu } from "antd";
import { dashboardForRole, useAuth } from "../context/AuthContext";
import DashboardHeader from "@/components/DashboardHeader";

const { Sider, Content, Footer } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const menuItems = [
  getItem(<Link href="/admin">Overview</Link>, "/admin", <PieChartOutlined />),
  getItem(
    <Link href="/admin/users">Users</Link>,
    "/admin/users",
    <UserOutlined />,
  ),
  getItem(
    <Link href="/admin/staff">Staff</Link>,
    "/admin/staff",
    <TeamOutlined />,
  ),
  getItem(
    <Link href="/admin/vehicles">Vehicles</Link>,
    "/admin/vehicles",
    <DesktopOutlined />,
  ),
  getItem(
    <Link href="/admin/quotes">Quotes</Link>,
    "/admin/quotes",
    <FileOutlined />,
  ),
  getItem(
    <Link href="/admin/rentals">Rentals</Link>,
    "/admin/rentals",
    <FileTextOutlined />,
  ),
];

function breadcrumbFromPath(pathname) {
  const labels = {
    admin: "Admin",
    users: "Users",
    staff: "Staff",
    vehicles: "Vehicles",
    quotes: "Quotes",
    rentals: "Rentals",
  };

  return pathname
    .split("/")
    .filter(Boolean)
    .map((part, index) => ({
      title:
        labels[part] ||
        part.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      key: `${part}-${index}`,
    }));
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace(dashboardForRole(user.role));
    }
  }, [loading, user, router]);

  const crumbs = breadcrumbFromPath(pathname);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            padding: 24,
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          {collapsed ? "SP" : "Service Panel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <DashboardHeader />

        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }} items={crumbs} />

          {children}
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Bijan Shakya (c) {new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}
