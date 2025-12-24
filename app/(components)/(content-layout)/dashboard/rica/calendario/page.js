"use client";
import OrdersRica from "@/components/OrdersRica";
import { parseDates } from "@/utils/excelUtils";
import { useEffect, useState } from "react";

export default function Home() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Carica automaticamente il file Excel
    const fetchOrders = async () => {
      const response = await fetch(
        "/api/fetch-excel-json?id=ANALISI&sheet=_0000"
      );
      const json = await response.json();
      let newOrders = json.data;
      newOrders = parseDates(newOrders, ["Data prevista consegna"]);
      setOrders(newOrders);
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <OrdersRica data={orders} />
    </div>
  );
}
