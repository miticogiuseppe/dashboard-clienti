"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export function useFetchResource() {
  const pathname = usePathname();
  const tenant = pathname.split("/")[2];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResource = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/fetch-resource?id=${id}`, {
        headers: {
          "x-tenant": tenant,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text);
        setLoading(false);
        return null;
      }

      const blob = await res.blob();

      // Estrai il filename dal header Content-Disposition
      const disposition = res.headers.get("Content-Disposition");
      let filename = "download.xlsx";
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      }

      setLoading(false);
      return { blob, filename };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { fetchResource, loading, error, tenant };
}
