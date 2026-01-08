"use client";
import OrderCalendar from "@/components/OrderCalendar";
import { parseDates } from "@/utils/excelUtils";
import { useEffect, useState } from "react";

export default function Home() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Carica automaticamente il file Excel
    const fetchOrders = async () => {
      const response = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1"
      );
      const json = await response.json();
      let newOrders = json.data;
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
