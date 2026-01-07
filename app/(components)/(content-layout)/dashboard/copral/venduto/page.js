"use client";
import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import AppmerceTable from "@/components/AppmerceTable";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { formatCurrency } from "@/utils/currency";

const Venduto = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [top20Data, setTop20Data] = useState([]);

  useEffect(() => {
    const fetchTop20Data = async () => {
      try {
        setIsLoading(true);
        // Chiamata specifica al foglio TOP20_2025
        const response = await fetch(
          "/api/fetch-excel-json?id=TOP20_VENDUTO&sheet=TOP20_2025"
        );
        const json = await response.json();

        if (json.data) {
          const processedData = json.data
            .filter(
              (item) =>
                item["CLIENTI"] &&
                !["TOTALE", ""].includes(String(item["CLIENTI"]).toUpperCase())
            )
            .slice(0, 20)
            .reverse()
            .map((item) => ({
              ...item,
              2023: formatCurrency(item["2023"]),
              2024: formatCurrency(item["2024"]),
              2025: formatCurrency(item["2025"]),
              "PREV 2025": formatCurrency(item["PREV 2025"]),
            }));

          setTop20Data(processedData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTop20Data();
  }, []);

  return (
    <>
      <Seo title="Analisi Venduto - Top 20" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Vendite"
            currentpage="Top 20 Clienti"
            activepage="Analisi"
          />

          <Row>
            <Col xl={12}>
              <AppmerceTable
                className="custom-card sibling-card"
                data={top20Data}
                title="Classifica Top 20 Clienti"
                enableSearch={true}
                // Utilizziamo le colonne reali del tuo foglio Excel
                tableHeaders={[
                  {
                    title: "Cliente",
                    column: "CLIENTI",
                    bold: true,
                  },
                  {
                    title: "Fatturato 2023",
                    column: "2023",
                  },
                  {
                    title: "Fatturato 2024",
                    column: "2024",
                  },
                  {
                    title: "Fatturato 2025",
                    column: "2025",
                  },
                  {
                    title: "Prev. 2025",
                    column: "PREV 2025",
                  },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Venduto;
