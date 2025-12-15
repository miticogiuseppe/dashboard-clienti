"use client";

import { Fragment, useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import dynamic from "next/dynamic";

import { loadSheet, parseDates, filterByRange } from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";

import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

// --- CONFIG ---
const COLONNA_DATA_ORA = "DATAORARIO";
const COLONNE_INGREDIENTI = Array.from({ length: 6 }, (_, i) => ({
  setpoint: `SETPOINT INGREDIENTE ${i + 1} (KG)`,
  consumo: `CONSUMO REALE INGREDIENTE ${i + 1} (KG)`,
}));
const COLONNE_TEMPI = {
  data: COLONNA_DATA_ORA,
  tempoLavorato: "TEMPO LAVORATO (MINUTI)",
  tempoStop: "TEMPO STOP (MINUTI)",
  tempoAllarme: "TEMPO STOP PER ALLARME (MINUTI)",
};

// --- UTILS ---
const calcolaRange = (periodo) => {
  const oggi = dayjs();
  const start = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  }[periodo];

  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: oggi.format("YYYY-MM-DD"),
  };
};

const fmt = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");

//               UNA SOLA FUNZIONE PER TUTTI I GRAFICI
const generaSerie = (data, colonne) =>
  colonne.map((c) => ({
    name: c.name,
    data: data.map((r) => ({
      x: dayjs(r[COLONNA_DATA_ORA]).format("DD/MM/YYYY HH:mm"),
      y: Number(r[c.col] || 0),
    })),
  }));
//                              COMPONENTE
export default function MacchinePage({ title, fileExcel }) {
  const [pickerDate, setPickerDate] = useState([null, null]);
  const [periodo, setPeriodo] = useState("mese");
  const { startDate, endDate } = calcolaRange(periodo);

  const start = fmt(pickerDate?.[0]) || startDate;
  const end = fmt(pickerDate?.[1]) || endDate;

  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ------------------------ FETCH + FILTER ------------------------
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);

        const resp = await fetch(`/api/download-resource?id=${fileExcel}`);
        const blob = await resp.blob();
        let sheet = await loadSheet(blob, "Foglio1");

        sheet = parseDates(sheet, [COLONNA_DATA_ORA]);
        sheet = filterByRange(
          sheet,
          COLONNA_DATA_ORA,
          dayjs(start),
          dayjs(end)
        );

        if (active) setFilteredData(sheet);
      } catch (e) {
        console.error("Errore caricamento Excel:", e);
        if (active) setFilteredData([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [fileExcel, start, end]);

  const categorieX = useMemo(
    () =>
      filteredData.map((r) =>
        dayjs(r[COLONNA_DATA_ORA]).format("DD/MM/YYYY HH:mm")
      ),
    [filteredData]
  );

  // ------------------------ GRAFICO TEMPI ------------------------
  const [seriesTempi, optionsTempi] = useMemo(() => {
    if (!filteredData.length) return [[], {}];

    const serie = generaSerie(filteredData, [
      { name: "Tempo Lavorato (min)", col: COLONNE_TEMPI.tempoLavorato },
      { name: "Tempo Stop (min)", col: COLONNE_TEMPI.tempoStop },
      { name: "Tempo Stop Allarme (min)", col: COLONNE_TEMPI.tempoAllarme },
    ]);

    const opts = {
      ...createOptions(filteredData, COLONNA_DATA_ORA, "Minuti", "line"),
      xaxis: { type: "category", categories: categorieX },
    };

    return [serie, opts];
  }, [filteredData]);

  // ------------------------ GRAFICO INGREDIENTI ------------------------
  const useCreaGraficoIngredienti = (nums) =>
    useMemo(() => {
      if (!filteredData.length) return [[], {}];

      const colonne = nums.flatMap((n) => [
        {
          name: `Setpoint Ingred. ${n} (KG)`,
          col: COLONNE_INGREDIENTI[n - 1].setpoint,
        },
        {
          name: `Consumo Ingred. ${n} (KG)`,
          col: COLONNE_INGREDIENTI[n - 1].consumo,
        },
      ]);

      const serie = generaSerie(filteredData, colonne);

      const opts = {
        ...createOptions(filteredData, COLONNA_DATA_ORA, "KG", "line"),
        xaxis: { type: "category", categories: categorieX },
      };

      return [serie, opts];
    }, [filteredData]);

  const [seriesIngred13, optionsIngred13] = useCreaGraficoIngredienti([
    1, 2, 3,
  ]);
  const [seriesIngred46, optionsIngred46] = useCreaGraficoIngredienti([
    4, 5, 6,
  ]);

  // ------------------------ RENDER CHART ------------------------
  const renderChart = (series, options) =>
    loading ? (
      <p>Caricamento dati...</p>
    ) : !series.length ? (
      <p>Nessun dato per il periodo selezionato.</p>
    ) : (
      <Spkapexcharts
        chartOptions={options}
        chartSeries={series}
        type="line"
        width="100%"
        height={315}
      />
    );

  // ------------------------ UI ------------------------
  return (
    <Fragment>
      <Row className="g-4 mb-4">
        <Col xl={6}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <Card.Title className="mb-0 fw-semibold">
                Seleziona Date
              </Card.Title>

              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted border"
                Toggletext="Periodo"
              >
                {["settimana", "mese", "anno"].map((p) => (
                  <Dropdown.Item
                    key={p}
                    onClick={() => {
                      setPeriodo(p);
                      setPickerDate([null, null]);
                    }}
                  >
                    {p === "settimana"
                      ? "Questa settimana"
                      : p === "mese"
                      ? "Ultimo mese"
                      : "Anno corrente"}
                  </Dropdown.Item>
                ))}
              </SpkDropdown>
            </Card.Header>

            <Card.Body>
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={setPickerDate}
                value={pickerDate}
              />
              <p className="text-muted mt-2 mb-3 small">
                ({start} → {end})
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={6}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Ingredienti 1–3
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {renderChart(seriesIngred13, optionsIngred13)}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Ingredienti 4–6
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {renderChart(seriesIngred46, optionsIngred46)}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Tempi di Produzione
              </Card.Title>
            </Card.Header>
            <Card.Body>{renderChart(seriesTempi, optionsTempi)}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
}
