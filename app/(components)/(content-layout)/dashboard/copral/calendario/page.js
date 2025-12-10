"use client";
import OrderCalendar from "@/components/OrderCalendar";
import { loadFirstSheet, parseDates } from "@/utils/excelUtils";
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
      let newOrders = await loadFirstSheet(blob);
      newOrders = parseDates(newOrders, ["Data Cons."]);
      setOrders(newOrders);
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <OrderCalendar data={orders} />
    </div>
  );
}
