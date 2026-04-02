"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PieChartOutlined } from "@ant-design/icons";
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

function breadcrumbFromPath(pathname) {
  const labels = {
    client: "Client",
    quotes: "Quotes",
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

export default function ClientLayout({ children }) {
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
    if (user.role !== "client") {
      router.replace(dashboardForRole(user.role));
    }
  }, [loading, user, router]);

  const crumbs = breadcrumbFromPath(pathname);

  const menuItems = [
    getItem(
      <Link href={`/client/dashboard`}>Dashboard</Link>,
      `/client/dashboard`,
      <PieChartOutlined />,
    ),
    getItem(
      <Link href="/client/quotes">Quotes</Link>,
      "/client/quotes",
      <PieChartOutlined />,
    ),
    getItem(
      <Link href="/client/past-rides">Past Rides</Link>,
      "/client/past-rides",
      <PieChartOutlined />,
    ),
  ];

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
          {collapsed ? "CP" : "Client Panel"}
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
