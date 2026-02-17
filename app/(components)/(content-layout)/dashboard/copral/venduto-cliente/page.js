"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  Fragment,
  useCallback,
} from "react";
import { Row, Col, Form } from "react-bootstrap";
import { useRouter } from "next/navigation";

import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { formatCurrency } from "@/utils/currency";

import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import { FaEuroSign, FaUserFriends } from "react-icons/fa";
import { PiTrendUp, PiPackage } from "react-icons/pi";

import AppmerceTable from "@/components/AppmerceTable";

const VendutoCliente = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [filteredTableData, setFilteredTableData] = useState(null);

  const [selectedYear, setSelectedYear] = useState("Tutti");
  const [availableYears, setAvailableYears] = useState([]);

  const handleFilteredChange = useCallback((rows) => {
    setFilteredTableData((prev) => {
      if (
        prev &&
        prev.length === rows.length &&
        prev.every((item, i) => item === rows[i])
      ) {
        return prev;
      }
      return rows;
    });
  }, []);

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (!session.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);

        const response = await fetch(
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_CLIENTE",
        );
        const json = await response.json();

        if (json.data) {
          let rawData = json.data;
          rawData.sort(
            (a, b) => (Number(b["Data"]) || 0) - (Number(a["Data"]) || 0),
          );

          const yearsSet = new Set();

          let processedData = rawData.map((riga) => {
            let newRow = { ...riga };
            let valData = newRow["Data"];
            let year = null;

            if (valData && typeof valData === "number") {
              const dateObj = new Date(
                Math.round((valData - 25569) * 86400 * 1000),
              );
              year = dateObj.getFullYear();
              yearsSet.add(year);
              newRow["Data"] = dateObj.toLocaleDateString("it-IT");
              newRow["Anno_Interno"] = year;
            }
            return newRow;
          });

          setAvailableYears(Array.from(yearsSet).sort((a, b) => b - a));

          let finalData = processedData;
          if (session.user.role === "CLIENTE" && session.user.codice_cliente) {
            const codiceCercato = String(session.user.codice_cliente).trim();
            finalData = processedData.filter(
              (riga) =>
                String(riga["Cliente/Fornitore"] || "").trim() ===
                codiceCercato,
            );
          }

          setData(finalData);
        }
      } catch (error) {
        console.error("Errore Copral:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [router]);

  const dataPerAnno = useMemo(() => {
    if (selectedYear === "Tutti") return data;
    return data.filter((item) => String(item.Anno_Interno) === selectedYear);
  }, [data, selectedYear]);

  const stats = useMemo(() => {
    const source = filteredTableData !== null ? filteredTableData : dataPerAnno;
    const totaleValore = source.reduce(
      (acc, curr) => acc + (Number(curr["Valore"]) || 0),
      0,
    );
    const totaleUtile = source.reduce(
      (acc, curr) => acc + (Number(curr["Utile totale"]) || 0),
      0,
    );
    const totaleQuantita = source.reduce(
      (acc, curr) => acc + (Number(curr["Quantita'"]) || 0),
      0,
    );
    const uniqueClients = new Set(
      source.map((item) => item["Cliente/Fornitore"]),
    ).size;

    return {
      valore: formatCurrency(totaleValore),
      utile: formatCurrency(totaleUtile),
      quantita: totaleQuantita.toLocaleString("it-IT"),
      clientiCount: uniqueClients,
    };
  }, [filteredTableData, dataPerAnno]);

  const dynamicCards = [
    {
      id: 1,
      title:
        selectedYear === "Tutti" ? "Totale Venduto" : `Venduto ${selectedYear}`,
      count: stats.valore,
      svgIcon: <FaEuroSign />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title:
        selectedYear === "Tutti" ? "Totale Utile" : `Utile ${selectedYear}`,
      count: stats.utile,
      svgIcon: <PiTrendUp />,
      backgroundColor: "success svg-white",
    },
    {
      id: 3,
      title: "Volume Pezzi",
      count: stats.quantita,
      svgIcon: <PiPackage />,
      backgroundColor: "info svg-white",
    },
    {
      id: 4,
      title: user?.role === "CLIENTE" ? "Codice Cliente" : "Clienti Attivi",
      count:
        user?.role === "CLIENTE" ? user?.codice_cliente : stats.clientiCount,
      svgIcon: <FaUserFriends />,
      backgroundColor: "warning svg-white",
    },
  ];

  return (
    <Fragment>
      <Seo title="Copral - Analisi Venduto" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <Fragment>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <Pageheader
              title="Copral"
              currentpage={
                user?.role === "CLIENTE"
                  ? "I Miei Acquisti"
                  : "Analisi Venduto Cliente"
              }
              activepage="Dashboard"
            />

            <div className="d-flex align-items-center bg-white p-2 rounded shadow-sm border">
              <span className="me-2 fw-bold text-muted">Anno:</span>
              <Form.Select
                style={{ width: "120px" }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="Tutti">Tutti</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <Row className="mb-4">
            {dynamicCards.map((card) => (
              <Col xxl={3} xl={3} lg={6} key={card.id}>
                <Spkcardscomponent
                  cardClass="overflow-hidden main-content-card"
                  headingClass="d-block mb-1"
                  mainClass="d-flex align-items-start justify-content-between mb-2"
                  svgIcon={card.svgIcon}
                  card={card}
                  badgeClass="md"
                  dataClass="mb-0"
                />
              </Col>
            ))}
          </Row>

          <AppmerceTable
            data={dataPerAnno}
            title={
              user?.role === "CLIENTE"
                ? `Dettaglio per ${user.username}`
                : "Report Vendite Totale"
            }
            tableHeaders={[
              {
                title: "Cod. Cliente",
                column: "Cliente/Fornitore",
                bold: true,
              },
              {
                title: "Ragione Sociale",
                column: "Descrizione Cliente/Fornitore",
              },
              { title: "Data", column: "Data" },
              { title: "Quantità", column: "Quantita'", type: "number" },
              { title: "Valore", column: "Valore", type: "number" },
              { title: "Utile", column: "Utile totale", type: "number" },
            ]}
            enableSearch={true}
            onFilteredDataChange={handleFilteredChange}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

export default VendutoCliente;
