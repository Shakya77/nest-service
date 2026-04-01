"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  Descriptions,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import api from "@/lib/api";

const { Title, Text } = Typography;

const statusColors = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export default function page() {
  const params = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const quoteId = params?.id;

  useEffect(() => {
    if (!quoteId) return;
    const fetchQuote = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/quotes/${quoteId}`);
        setQuote(data);
      } catch (err) {
        message.error(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [quoteId]);

  return (
    <div className="flex flex-col gap-8">
      <Space align="center">
        <Title level={3} style={{ margin: 0 }}>
          Quote details
        </Title>
      </Space>

      <Card loading={loading}>
        {quote ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Vehicle">
              {quote.vehicleName}
            </Descriptions.Item>
            <Descriptions.Item label="Requested Km">
              {quote.requestedKm}
            </Descriptions.Item>
            <Descriptions.Item label="Estimated Price">
              {Number(quote.estimatedPrice || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date">
              {quote.bookingDate
                ? dayjs(quote.bookingDate).format("MMM D, YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Pickup Location">
              {quote.pickupLocation || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[quote.status] || "blue"}>
                {quote.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">No quote found.</Text>
        )}
      </Card>
    </div>
  );
}
