"use client";
import OrderCalendar from "@/components/OrderCalendar";
import { loadFirstSheet } from "@/utils/excelUtils";
import { useEffect, useState } from "react";

export default function Home() {
  const [orders, setOrders] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const newOrders = await loadFirstSheet(file);
      setOrders(newOrders);
    }
  };

  useEffect(() => {
    // Carica automaticamente il file Excel
    const fetchOrders = async () => {
      const response = await fetch("/data/APPMERCE-000.xlsx");
      const blob = await response.blob();
      const newOrders = await loadFirstSheet(blob);

      setOrders(newOrders);
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <OrderCalendar orders={orders} />
    </div>
  );
}
