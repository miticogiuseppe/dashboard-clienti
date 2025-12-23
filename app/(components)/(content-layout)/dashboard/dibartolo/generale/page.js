"use client";
import AppmerceTable from "@/components/AppmerceTable";
import "@/lib/chart-setup";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { extractUniques, parseDates, sumByKey } from "@/utils/excelUtils";
import { formatDate, formatTime } from "@/utils/format";
import { createOptions } from "@/utils/graphUtils";
import Preloader from "@/utils/Preloader";
import _ from "lodash";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { FaUsers } from "react-icons/fa6";
import { IoIosCalendar } from "react-icons/io";
import { PiPackage } from "react-icons/pi";

// Componente ApexCharts caricato dinamicamente
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

// Opzioni base per ilgrafico a barre
const barChartOptions = createOptions({
  chart: {
    type: "bar",
    height: 350,
  },
  plotOptions: {
    bar: {
      horizontal: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  title: {
    text: "Quantità per Famiglia di Prodotto (Esclusi Imballaggi)",
  },
  xaxis: {
    title: {
      text: "Qta/kg da ev.",
    },
    labels: {
      formatter: function (val) {
        return val.toLocaleString("it-IT");
      },
    },
  },
});

const Ecommerce = () => {
  // Stati unificati e logica di filtro per data
  const [isLoading, setIsLoading] = useState(true);
  const [sheetData, setSheetData] = useState(undefined);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // NUOVI stati per il Grafico a Barre
  const [graphOptions, setGraphOptions] = useState(barChartOptions); // Opzioni per il grafico a barre
  const [graphSeries, setGraphSeries] = useState([]); // Serie per il grafico a barre
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0); // Rinomino lo stato per Totale ordini

  // Vecchi stati rimossi o rinominati:
  // const [chartOptions, setChartOptions] = useState(undefined); // Rimosso
  // const [chartSeries, setChartSeries] = useState(undefined); // Rimosso
  // const [pieData, setPieData] = useState(undefined); // Rimosso
  // const [top3, setTop3] = useState([]); // Rimosso

  // Dati per la tabella e le card
  const [recentOrders, setRecentOrders] = useState([]);
  // const [totalUniqueOrders, setTotalUniqueOrders] = useState(0); // SOSTITUITO da pendingOrdersCount
  const [totalUniqueCustomers, setTotalUniqueCustomers] = useState(0);

  // data del file
  const [fileDate, setFileDate] = useState(undefined);

  const t = useTranslations("Graph");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch del foglio Excel
      const response = await fetch(
        "/api/fetch-excel-json?id=ANALISI&sheet=appmerce_db"
      );
      let json = await response.json();
      let data = json.data;
      data = parseDates(data, ["Data ordine", "Data cons. rich."]); // Converte le date in oggetti Moment/Date
      setSheetData(data);
      setFileDate(new Date(json.lwt));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!sheetData) return;
    let filteredData = sheetData;

    // ----------------------- Filtra i dati in base all'intervallo di date

    if (startDate && endDate) {
      const start = startDate;
      const end = endDate;

      filteredData = sheetData.filter((item) => {
        const d = item["Data ordine"];
        return d.isSameOrAfter(start, "day") && d.isSameOrBefore(end, "day");
      });
    }

    // ----------------------- Logica per Tabella (Ordini recenti)

    const sortedData = filteredData.sort((a, b) =>
      a["Data ordine"].isBefore(b["Data ordine"]) ? 1 : -1
    );
    const uniqData = _.uniqBy(sortedData, "Nr. ord.");
    setRecentOrders(uniqData);

    // ----------------------- Logica per Card (Statistiche principali)

    // Totale ordini unici (Ora Pending Orders)
    const uniqueOrderNumbers = extractUniques(filteredData, "Nr. ord.");
    setPendingOrdersCount(uniqueOrderNumbers.length); // DENOMINATORE AGGIORNATO

    // Totale clienti unici
    const uniqueCustomersCount = extractUniques(
      filteredData,
      "Ragione sociale"
    ).length;
    setTotalUniqueCustomers(uniqueCustomersCount);

    // ----------------------- Logica per Grafico a Barre (Analisi Quantità)
    // Filtra i dati escludendo la famiglia "IMBALLAGGI"
    const filteredDataExcludingImballaggi = filteredData.filter(
      (item) => item["Descrizione famiglia"] !== "IMBALLAGGI"
    );

    // Somma la quantità per ogni "Descrizione famiglia"
    const counters = sumByKey(
      filteredDataExcludingImballaggi,
      "Descrizione famiglia",
      "Qta/kg da ev."
    );

    // Ordina i risultati e prepara le serie per ApexCharts
    const topCounters = counters.sort((a, b) => b.count - a.count);

    // Filtra per visualizzare i primi 30, ad esempio.
    const top10Counters = topCounters.slice(0, 30);

    setGraphSeries([
      {
        name: t("Quantity"),
        data: top10Counters.map((c) => ({
          x: c["Descrizione famiglia"],
          y: Number(c.count),
        })),
      },
    ]);

    // Aggiorna le opzioni per le categorie, per visualizzare solo le famiglie top
    setGraphOptions({
      ...barChartOptions,
      xaxis: {
        ...barChartOptions.xaxis,
        categories: top10Counters.map((c) => c["Descrizione famiglia"]),
      },
    });

    // ----------------------- fine caricamento

    setIsLoading(false);
  }, [sheetData, startDate, endDate, t]); // Aggiunto 't' tra le dipendenze

  // Cards unificate e dinamiche
  const dynamicCards = [
    {
      id: 1,
      title: "Ultimo aggiornamento",
      count: formatDate(fileDate),
      inc: formatTime(fileDate),
      svgIcon: <IoIosCalendar />,
      backgroundColor: "info svg-white",
      color: "success",
    },
    {
      id: 2,
      title: "Totale ordini",
      count: pendingOrdersCount.toLocaleString("it-IT"), // AGGIORNATO
      svgIcon: <PiPackage />,
      backgroundColor: "primary3 svg-white",
      color: "success",
    },
    {
      id: 3,
      title: "Totale clienti",
      count: totalUniqueCustomers.toLocaleString("it-IT"),
      svgIcon: <FaUsers />,
      backgroundColor: "primary svg-white",
      color: "success",
    },
  ];

  return (
    <Fragment>
      {" "}
      {/* Usato Fragment per coerenza con l'output richiesto */}
      <Seo title="Dibartolo Generale" />
      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Dashboards"
            currentpage="Generale"
            activepage="Generale"
            showActions={false}
          />

          <Row>
            {/* Card statistiche */}
            {dynamicCards.map((idx) => (
              <Col xxl={4} xl={4} lg={6} key={idx.id}>
                {" "}
                {/* Modificata la dimensione per 3 card */}
                <Spkcardscomponent
                  cardClass="overflow-hidden main-content-card"
                  headingClass="d-block mb-1"
                  mainClass="d-flex align-items-start justify-content-between mb-2"
                  svgIcon={idx.svgIcon}
                  card={idx}
                  badgeClass="md"
                  dataClass="mb-0"
                />
              </Col>
            ))}
          </Row>

          <Row className="stretch-row">
            {/* Tabella Ordini */}
            <Col xxl={8} xl={12} className="stretch-column">
              <AppmerceTable
                className="custom-card sibling-card"
                data={recentOrders}
                title="Ordini"
                dateColumn="Data ordine"
                enableSearch={true}
                tableHeaders={[
                  { title: "Data ord.", column: "Data ordine" },
                  { title: "Num. ord.", column: "Nr. ord.", type: "number" },
                  { title: "Ser.", column: "Ser.", type: "number" },
                  { title: "Cod. Cliente", column: "Cod. Cliente" },
                  {
                    title: "Rag. Soc.",
                    column: "Ragione sociale",
                    default: "Cliente generico",
                    bold: true,
                  },
                  { title: "Cod. Art.", column: "Articolo" },
                  { title: "Descr. Art", column: "Descrizione art. cliente" },
                  { title: "Qta/kg OV", column: "Qta/kg OV", type: "number" },
                  {
                    title: "Qta/kg evasa",
                    column: "Qta/kg evasa",
                    type: "number",
                    allowZero: true,
                  },
                  {
                    title: "Qta/kg da ev.",
                    column: "Qta/kg da ev.",
                    type: "number",
                    allowZero: true,
                  },
                  { title: "Data Cons. Rich.", column: "Data cons. rich." },
                ]}
              />
            </Col>

            {/* Analisi Quantità (NUOVO Grafico a Barre) */}
            <Col xxl={4} xl={12} className="stretch-column">
              {/* Uso `stretch-card` per espandere l'altezza */}
              <Card className="custom-card fixed-height-card">
                <Card.Header>
                  <Card.Title>Analisi Quantità</Card.Title>
                </Card.Header>

                {/* Aggiungiamo `d-flex flex-column` e `flex-grow-1` per far sì che il body riempia lo spazio */}
                <Card.Body className="d-flex flex-column h-100 flex-grow-1 p-3 w-100">
                  {/* Il div interno prende l'altezza completa */}
                  <div className="h-100 w-100 flex-grow-1">
                    {graphSeries.length > 0 &&
                    graphSeries[0].data.length > 0 ? (
                      <Spkapexcharts
                        chartOptions={graphOptions}
                        chartSeries={graphSeries}
                        type="bar"
                        // Altezza impostata a '100%' per riempire il div contenitore
                        height={"100%"}
                      />
                    ) : (
                      <p className="text-muted text-center">
                        Nessun dato disponibile
                      </p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Fragment>
  );
};

export default Ecommerce;
