"use client";

import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";

import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { formatCurrency } from "@/utils/currency";

import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import { FaEuroSign, FaUserFriends } from "react-icons/fa";
import { PiPackage, PiTrendUp } from "react-icons/pi";

import AppmerceTable from "@/components/AppmerceTable";
import GlobalContext from "@/context/GlobalContext";
import { fetchCsvCached } from "@/utils/resourceCache";
import { useContext } from "react";

const VendutoCliente = () => {
  const { username } = useContext(GlobalContext);

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [filteredTableData, setFilteredTableData] = useState(null);

  const [selectedYears, setSelectedYears] = useState([]);
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

        const json = await fetchCsvCached(
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_CLIENTE",
          undefined,
          username,
        );

        if (json.data) {
          let rawData = json.data;
          rawData.sort(
            (a, b) => (Number(b["Data"]) || 0) - (Number(a["Data"]) || 0),
          );

          const yearsSet = new Set();

          let processedData = rawData.map((riga) => {
            let newRow = { ...riga };
            let valData = newRow["Data"];

            if (valData && typeof valData === "number") {
              const dateObj = new Date(
                Math.round((valData - 25569) * 86400 * 1000),
              );
              const year = dateObj.getFullYear();
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
        console.error("Errore caricamento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [router]);

  const toggleYear = useCallback((year) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  }, []);

  const dataPerAnno = useMemo(() => {
    if (selectedYears.length === 0) return data;
    return data.filter((item) =>
      selectedYears.includes(String(item.Anno_Interno)),
    );
  }, [data, selectedYears]);

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

  const yearLabel = useMemo(() => {
    if (selectedYears.length === 0) return null;
    if (selectedYears.length === 1) return selectedYears[0];
    return selectedYears
      .slice()
      .sort((a, b) => a - b)
      .join(", ");
  }, [selectedYears]);

  const dynamicCards = [
    {
      id: 1,
      title: yearLabel ? `Venduto ${yearLabel}` : "Totale Venduto",
      count: stats.valore,
      svgIcon: <FaEuroSign />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title: yearLabel ? `Utile ${yearLabel}` : "Totale Utile",
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

  const clienteLabel = user
    ? `${user.username}${user.codice_cliente ? ` (${user.codice_cliente})` : ""}`
    : "Utente";

  return (
    <Fragment>
      <Seo title={`Area Cliente - ${user?.username || "Analisi"}`} />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <Fragment>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <Pageheader
              title="Area Cliente"
              currentpage={`Benvenuto, ${clienteLabel}`}
              activepage="Analisi Vendite"
            />

            <div className="d-flex align-items-center bg-white p-2 rounded shadow-sm border gap-2 flex-wrap">
              <span className="fw-bold text-muted">Anno:</span>

              <button
                className={`btn btn-sm ${
                  selectedYears.length === 0
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setSelectedYears([])}
              >
                Tutti
              </button>

              {availableYears.map((year) => (
                <button
                  key={year}
                  className={`btn btn-sm ${
                    selectedYears.includes(String(year))
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => toggleYear(String(year))}
                >
                  {year}
                </button>
              ))}
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
                : "Dettaglio Vendite Totali"
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
              { title: "Totale Venduto", column: "Valore", type: "number" },
              {
                title: "Utile (Margine)",
                column: "Utile totale",
                type: "number",
              },
            ]}
            enableSearch={true}
            searchPlaceholder="Cerca"
            onFilteredDataChange={handleFilteredChange}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

export default VendutoCliente;
