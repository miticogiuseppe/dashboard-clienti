const DibartoloListModal = ({ orders, onClose }) => {
  if (!orders || orders.length === 0) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") onClose();
  };

  const modalContentStyle = {
    backgroundColor: "var(--modal-bg)",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    position: "relative",
    maxWidth: "820px", // Limite massimo per desktop
    maxHeight: "80vh", // Limite massimo per desktop
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",

    // Adattamenti per Mobile:
    width: "90%",
    "@media (max-width: 600px)": {},
  };

  const tableContainerStyle = {
    maxHeight: "60vh",
    overflowY: "auto",
    border: "1px solid var(--modal-border)",
    borderRadius: "0.5rem",
    // --- IMPORTANTE PER MOBILE: Abilita lo scorrimento orizzontale per la tabella ---
    overflowX: "auto",
    //position: "relative",
  };
  // Stili per il contenitore del modale (la parte bianca):
  const mobileOptimizedModal = {
    backgroundColor: "var(--modal-bg)",
    color: "var(--modal-text)",
    padding: "1rem", // Riduci il padding su mobile
    borderRadius: "0.5rem",
    position: "relative",
    // Modifiche per mobile:
    width: "95%", // Quasi a tutta larghezza
    margin: "1rem", // Lascia un po' di margine
    maxWidth: "820px",
    maxHeight: "95vh", // Quasi a tutta altezza
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    boxSizing: "border-box",
  };

  return (
    <div
      id="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Opzionale: Aggiungere scroll se il modale è più alto dello schermo
        overflow: "auto",
      }}
    >
      <div
        style={mobileOptimizedModal} // Usiamo gli stili ottimizzati
        onClick={(e) => e.stopPropagation()} // Impedisce la chiusura cliccando all'interno
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            paddingTop: "1rem",
            // Riduci la dimensione del font su mobile se necessario
            // fontSize: window.innerWidth < 600 ? "1rem" : "1.25rem", // Esempio con window.innerWidth (non raccomandato)
          }}
        >
          Dettagli Ordini ({orders.length})
        </h2>

        <div style={tableContainerStyle}>
          {" "}
          {/* Contenitore con scorrimento orizzontale */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px", // Aggiungi una larghezza minima per forzare lo scroll orizzontale su mobile
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "var(--modal-header-bg)",
                zIndex: 10,
              }}
            >
              <tr>
                {/* Num. Ordine - compatta */}
                <th
                  style={{
                    textAlign: "center",
                    padding: "0.5rem",
                    width: "90px",
                    fontSize: "0.75rem", // Riduzione font per far stare tutto
                  }}
                >
                  N. Ord
                </th>

                {/* Sezione - super stretta */}
                <th
                  style={{
                    textAlign: "center",
                    padding: "0.5rem",
                    width: "45px",
                    fontSize: "0.75rem", // Riduzione font per far stare tutto
                  }}
                >
                  Ser.
                </th>

                {/* Sezione - super stretta */}
                <th
                  style={{
                    textAlign: "center",
                    padding: "0.5rem",
                    width: "45px",
                    fontSize: "0.75rem", // Riduzione font per far stare tutto
                  }}
                >
                  Famiglia
                </th>

                <th
                  style={{
                    textAlign: "center",
                    padding: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                >
                  Gruppo
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                >
                  Cliente
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.5rem",
                    whiteSpace: "normal", // Permette al testo di andare a capo
                    overflow: "visible", // Rimuove l'occultamento del testo
                    textOverflow: "clip", // Rimuove i tre puntini
                    maxWidth: "200px", // Suggerimento di larghezza
                  }}
                >
                  Articolo
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.5rem",
                    whiteSpace: "normal", // Permette al testo di andare a capo
                    overflow: "visible", // Rimuove l'occultamento del testo
                    textOverflow: "clip", // Rimuove i tre puntini
                    maxWidth: "200px", // Suggerimento di larghezza
                  }}
                >
                  Q.tà/kg
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, idx) => (
                <tr key={idx} style={{ fontSize: "0.75rem" }}>
                  {/* {" "} */}
                  {/* Riduci la dimensione del font per i dati */}
                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.numOrdine ?? "N/A"}
                  </td>
                  {/* Sezione stretta centrata */}
                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.sezione}
                  </td>
                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.famiglia}
                  </td>

                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.gruppo}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      whiteSpace: "normal",
                      overflow: "visible",
                      textOverflow: "clip",
                      wordBreak: "break-word",
                      maxWidth: "250px", // Limita la larghezza per i nomi lunghi su mobile
                    }}
                  >
                    {order.cliente}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      whiteSpace: "normal",
                      overflow: "visible",
                      textOverflow: "clip",
                      wordBreak: "break-word",
                      maxWidth: "250px", // Limita la larghezza per gli articoli lunghi su mobile
                    }}
                  >
                    {order.articolo ?? "N/A"}
                  </td>
                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.quantità}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            // Migliora la zona di tocco su mobile (opzionale)
            padding: "0.5rem",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default DibartoloListModal;
