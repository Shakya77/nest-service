"use client";

import api from "@/lib/api";
import { Card, message, Table } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function page() {
  const params = useParams();
  const vehicleId = params?.id;
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  const fetchVehicleRecord = async () => {
    let data;

    try {
      const response = await api.get(`/vehicles/${vehicleId}/records`);
      data = response.data;
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    } finally {
      setVehicleDetails(data);
    }
  };

  const getVehicleDetails = async () => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}`);
      setVehicle(response.data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchVehicleRecord();
    getVehicleDetails();
  }, []);

  console.table(vehicle);

  const columns = [
    {
      title: "S.No",
      dataIndex: "sn",
      key: "sn",
      render(text, record, index, ad) {
        return index + 1;
      },
    },
    { title: "Client Name", dataIndex: "clientName", key: "clientName" },
    {
      title: "Estimated Price",
      dataIndex: "estimatedPrice",
      key: "estimatedPrice",
    },
    {
      title: "Requested Km",
      dataIndex: "requestedKm",
      key: "requestedKm",
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (value) =>
        value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-",
    },
    {
      title: "Pickup Location",
      dataIndex: "pickupLocation",
      key: "pickupLocation",
    },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div>
      <Card
        title={`Vehicle ${vehicle?.name} (${vehicle?.registrationNo}) Details`}
      >
        <Table
          dataSource={vehicleDetails}
          rowKey="id"
          columns={columns}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
