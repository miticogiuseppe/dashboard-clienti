"use client";
import OrderCalendar from "@/components/OrderCalendar";
import OrdersDibartolo from "@/components/OrdersDibartolo";
import { loadFirstSheet, parseDates } from "@/utils/excelUtils";
import { useEffect, useState } from "react";

export default function Calendar() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Carica automaticamente il file Excel
    const fetchOrders = async () => {
      const response = await fetch(
        "/api/fetch-excel-json?id=ANALISI&sheet=appmerce_db"
      );
      const json = await response.json();
      let newOrders = json.data;
      newOrders = parseDates(newOrders, ["Data cons. rich."]);
      setOrders(newOrders);
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <OrdersDibartolo data={orders} />
    </div>
  );
}
