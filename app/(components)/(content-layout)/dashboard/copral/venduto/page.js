"use client";
import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import AppmerceTable from "@/components/AppmerceTable";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { formatCurrency } from "@/utils/currency";
import VendutoChart from "@/components/VendutoChart";
import { useRouter } from "next/navigation"; // 1. Importa il router

const Venduto = () => {
  const router = useRouter(); // 2. Inizializza il router
  const [isLoading, setIsLoading] = useState(true);
  const [top20Data, setTop20Data] = useState([]);
  const [rawChartData, setRawChartData] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false); // 3. Stato per autorizzazione

  useEffect(() => {
    const fetchAndCheck = async () => {
      setIsLoading(true);

      // RECUPERO SESSIONE/TOKEN DAL SERVER
      const sessionRes = await fetch("/api/auth/session"); // O il tuo endpoint di sessione
      const session = await sessionRes.json();
      const role = session?.user?.role;

      // 4. CONTROLLO RUOLO: Se è un Agente, lo mandiamo via
      if (role === "AGENTE") {
        router.push("/dashboard/copral/statistiche-venduto");
        return;
      }

      if (role === "CLIENTE") {
        router.push("/dashboard/copral/venduto-cliente");
        return;
      }

      // Se arriviamo qui, l'utente è Direzione o Ufficio
      setIsAuthorized(true);

      try {
        const response = await fetch(
          "/api/fetch-excel-json?id=TOP20_VENDUTO&sheet=TOP20_2025",
        );
        const json = await response.json();

        if (json.data) {
          // ... (Tutta la tua logica di filtraggio e map che avevi già scritto)
          const filtered = json.data
            .filter(
              (item) =>
                item["CLIENTI"] && String(item["CLIENTI"]).trim() !== "",
            )
            .slice(0, 20);

          setRawChartData(filtered);

          const tableData = [...filtered].reverse().map((item) => {
            const d24 = Number(item["DELTA 25/24"]) || 0;
            const d23 = Number(item["DELTA 25/23"]) || 0;
            const d24Text = (d24 * 100).toFixed(2).replace(".", ",") + "%";
            const d23Text = (d23 * 100).toFixed(2).replace(".", ",") + "%";

            return {
              ...item,
              2023: formatCurrency(item["2023"]),
              2024: formatCurrency(item["2024"]),
              2025: formatCurrency(item["2025"]),
              "PREV 2025": formatCurrency(item["PREV 2025"]),
              2026: formatCurrency(item["2026"]),
              "PREV 2026": formatCurrency(item["PREV 2026"]),
              "DELTA 25/24": (
                <span className={d24 >= 0 ? "text-success" : "text-danger"}>
                  {d24Text}
                  <i
                    className={
                      d24 >= 0
                        ? "ri-arrow-up-fill ms-1"
                        : "ri-arrow-down-fill ms-1"
                    }
                  ></i>
                </span>
              ),
              "DELTA 25/23": (
                <span className={d23 >= 0 ? "text-success" : "text-danger"}>
                  {d23Text}
                  <i
                    className={
                      d23 >= 0
                        ? "ri-arrow-up-fill ms-1"
                        : "ri-arrow-down-fill ms-1"
                    }
                  ></i>
                </span>
              ),
            };
          });

          setTop20Data(tableData);
        }
      } catch (error) {
        console.error("Errore fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCheck();
  }, [router]);

  // 5. RITORNO CONDIZIONALE
  if (isLoading) return <Preloader show={true} />;
  if (!isAuthorized) return null; // Non mostra nulla se non autorizzato o in fase di redirect

  return (
    <>
      <Seo title="Analisi Venduto - Top 20" />
      <Pageheader
        title="Vendite"
        currentpage="Top 20 Clienti"
        activepage="Analisi"
      />
      <Row>
        <Col xl={12}>
          <VendutoChart data={rawChartData} />
        </Col>
      </Row>
      <Row>
        <Col xl={12}>
          <AppmerceTable
            className="custom-card sibling-card"
            data={top20Data}
            title="Classifica Top 20 Clienti"
            enableSearch={true}
            searchPlaceholder="Cerca Clienti..."
            tableHeaders={[
              { title: "Cliente", column: "CLIENTI", bold: true },
              { title: "Fatturato 2023", column: "2023", type: "number" },
              { title: "Fatturato 2024", column: "2024", type: "number" },
              { title: "Fatturato 2025", column: "2025", type: "number" },
              { title: "Prev. 2025", column: "PREV 2025", type: "number" },
              { title: "Fatturato 2026", column: "2026", type: "number" },
              { title: "Prev. 2026", column: "PREV 2026", type: "number" },
              { title: "Delta 25/24", column: "DELTA 25/24", type: "number" },
              { title: "Delta 25/23", column: "DELTA 25/23", type: "number" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Venduto;
