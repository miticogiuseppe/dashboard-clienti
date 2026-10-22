"use client";

import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";

import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { formatCurrency } from "@/utils/currency";

import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import { FaEuroSign } from "react-icons/fa";
import { PiPackage, PiTrendUp } from "react-icons/pi";

import AppmerceTable from "@/components/AppmerceTable";
import GlobalContext from "@/context/GlobalContext";
import { fetchCsvCached } from "@/utils/resourceCache";
import { useContext } from "react";

const VendutoAgente = () => {
  const { username } = useContext(GlobalContext);

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [filteredTableData, setFilteredTableData] = useState(null);

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

  // ==============================
  // Caricamento Sessione + Dati
  // ==============================
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
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_AGENTE",
          undefined,
          username,
        );

        if (json.data) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Errore nel caricamento dati:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [router]);

  // ==============================
  // Calcolo Statistiche dinamiche
  // ==============================
  const stats = useMemo(() => {
    const source = filteredTableData !== null ? filteredTableData : data;

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

    return {
      valore: formatCurrency(totaleValore),
      utile: formatCurrency(totaleUtile),
      quantita: totaleQuantita.toLocaleString("it-IT"),
      count: source.length,
    };
  }, [filteredTableData, data]);

  // ==============================
  // Card dinamiche Xintra style
  // ==============================
  const dynamicCards = [
    {
      id: 1,
      title: "Totale Valore",
      count: stats.valore,
      svgIcon: <FaEuroSign />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title: "Totale Utile",
      count: stats.utile,
      svgIcon: <PiTrendUp />,
      backgroundColor: "success svg-white",
    },
    {
      id: 3,
      title: "Volume Quantità",
      count: stats.quantita,
      svgIcon: <PiPackage />,
      backgroundColor: "info svg-white",
    },
  ];

  const agenteLabel = user
    ? `${user.username}${user.codice_agente ? ` (${user.codice_agente})` : ""}`
    : "Utente";

  return (
    <Fragment>
      <Seo title={`Vendite - ${user?.username || "Agente"}`} />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <Fragment>
          <Pageheader
            title="Area Agente"
            currentpage={`Benvenuto, ${agenteLabel}`}
            activepage="Analisi Vendite"
          />

          {/* ============================== */}
          {/* CARD DASHBOARD */}
          {/* ============================== */}
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

          {/* ============================== */}
          {/* TABELLA DATI */}
          {/* ============================== */}

          <AppmerceTable
            data={data}
            title={`Dettaglio Vendite: ${agenteLabel}`}
            tableHeaders={[
              {
                title: "Codice",
                column: "Cliente/Fornitore",
                bold: true,
              },
              {
                title: "Ragione Sociale",
                column: "Descrizione Cliente/Fornitore",
              },
              {
                title: "Quantità",
                column: "Quantita'",
                type: "number",
              },
              {
                title: "Valore",
                column: "Valore",
                type: "number",
              },
              {
                title: "Utile Totale",
                column: "Utile totale",
                type: "number",
              },
            ]}
            enableSearch={true}
            searchPlaceholder="Cerca cliente..."
            className="custom-card"
            onFilteredDataChange={handleFilteredChange}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

export default VendutoAgente;
