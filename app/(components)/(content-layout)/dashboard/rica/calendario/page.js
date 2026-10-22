"use client";
import OrdersRica from "@/components/OrdersRica";
import GlobalContext from "@/context/GlobalContext";
import { parseDates } from "@/utils/excelUtils";
import { fetchCsvCached } from "@/utils/resourceCache";
import { useContext, useEffect, useState } from "react";

export default function Home() {
  const { username } = useContext(GlobalContext);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Carica automaticamente il file Excel
    const fetchOrders = async () => {
      const json = await fetchCsvCached(
        "/api/fetch-excel-json?id=ANALISI",
        undefined,
        username,
      );
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
