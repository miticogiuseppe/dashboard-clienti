"use client";
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import { Row, Col, Card, Table, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import SearchBox from "@/components/SearchBox";
import { checkRow } from "@/utils/filters";
import { formatCurrency } from "@/utils/currency";

const VendutoAgente = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    cliente: { search: "", selected: undefined },
  });

  // 1. Caricamento Sessione e Dati (Filtro automatico lato server tramite API)
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

        // Chiamata all'ID centralizzato definito nel tuo filedb.json
        const response = await fetch(
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_AGENTE",
        );
        const json = await response.json();

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

  // 2. Logica dei filtri (Puntiamo sulla Descrizione per la ricerca)
  const handleFilter = useCallback((val) => {
    setFilters((prev) => ({ ...prev, cliente: val }));
  }, []);

  const listaClienti = useMemo(() => {
    return Array.from(
      new Set(
        data?.map((d) => d["Descrizione Cliente/Fornitore"]).filter(Boolean) ||
          [],
      ),
    );
  }, [data]);

  const filteredData = useMemo(() => {
    return (
      data?.filter((item) =>
        checkRow(item, "Descrizione Cliente/Fornitore", filters.cliente),
      ) ?? []
    );
  }, [data, filters]);

  // 3. Calcolo statistiche basate sulla colonna "Valore" dell'Excel attuale
  const stats = useMemo(() => {
    const totaleValore = filteredData.reduce(
      (acc, curr) => acc + (Number(curr["Valore"]) || 0),
      0,
    );
    const totaleUtile = filteredData.reduce(
      (acc, curr) => acc + (Number(curr["Utile totale"]) || 0),
      0,
    );
    const totaleQuantita = filteredData.reduce(
      (acc, curr) => acc + (Number(curr["Quantita'"]) || 0),
      0,
    );

    return {
      valore: formatCurrency(totaleValore),
      utile: formatCurrency(totaleUtile),
      quantita: totaleQuantita.toLocaleString("it-IT"),
      count: filteredData.length,
    };
  }, [filteredData]);

  return (
    <Fragment>
      <Seo title={`Vendite - ${user?.username || "Agente"}`} />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <Fragment>
          <Pageheader
            title="Area Agente"
            currentpage={`Benvenuto, ${user?.username || "Utente"}`}
            activepage="Analisi Vendite"
          />

          {/* --- CARDS RIEPILOGATIVE --- */}
          <Row className="mb-4">
            <Col xl={4}>
              <Card className="custom-card shadow-sm border-top border-4 border-primary">
                <Card.Body>
                  <p className="text-muted mb-1 fs-12 uppercase fw-semibold">
                    Totale Valore Filtrato
                  </p>
                  <h4 className="fw-bold mb-0">{stats.valore}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4}>
              <Card className="custom-card shadow-sm border-top border-4 border-success">
                <Card.Body>
                  <p className="text-success mb-1 fs-12 uppercase fw-semibold">
                    Totale Utile
                  </p>
                  <h4 className="fw-bold mb-0">{stats.utile}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4}>
              <Card className="custom-card shadow-sm border-top border-4 border-info">
                <Card.Body>
                  <p className="text-muted mb-1 fs-12 uppercase fw-semibold">
                    Volume Quantità
                  </p>
                  <h4 className="fw-bold mb-0">{stats.quantita}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* BOX RICERCA */}
          <Card className="custom-card mb-4 shadow-sm">
            <Card.Body>
              <SearchBox
                data={listaClienti}
                name="Cerca Cliente"
                onSearch={handleFilter}
                placeholder="Scrivi la ragione sociale..."
              />
            </Card.Body>
          </Card>

          {/* TABELLA DATI */}
          <Card className="custom-card shadow-sm">
            <Card.Header className="justify-content-between">
              <Card.Title>Dettaglio Portafoglio: {user?.username}</Card.Title>
              <Badge bg="primary-transparent">
                {stats.count} Clienti visualizzati
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead>
                    <tr className="table-light">
                      <th className="ps-3" style={{ width: "120px" }}>
                        Codice
                      </th>
                      <th>Ragione Sociale</th>
                      <th className="text-end">Quantità</th>
                      <th className="text-end text-primary">Valore</th>
                      <th className="text-end pe-3">Utile Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row, i) => (
                        <tr key={i}>
                          {/* Codice */}
                          <td className="ps-3 text-muted fs-11 fw-semibold">
                            {row["Cliente/Fornitore"]}
                          </td>
                          {/* Ragione Sociale */}
                          <td className="fw-medium">
                            {row["Descrizione Cliente/Fornitore"]}
                          </td>
                          {/* Quantità */}
                          <td className="text-end">
                            {Number(row["Quantita'"]).toLocaleString("it-IT")}
                          </td>
                          {/* Valore */}
                          <td className="text-end text-primary fw-bold">
                            {formatCurrency(row["Valore"])}
                          </td>
                          {/* Utile */}
                          <td className="text-end pe-3 fw-bold">
                            {formatCurrency(row["Utile totale"])}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-4 text-muted">
                          Nessun dato trovato per la ricerca effettuata.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Fragment>
      )}
    </Fragment>
  );
};

export default VendutoAgente;
