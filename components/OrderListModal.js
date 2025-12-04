const OrderListModal = ({ orders, onClose }) => {
  if (!orders || orders.length === 0) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") onClose();
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
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          position: "relative",
          maxWidth: "820px",
          maxHeight: "80vh",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            paddingTop: "1rem",
          }}
        >
          Dettagli Ordini ({orders.length})
        </h2>

        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "0.5rem",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
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
                  }}
                >
                  Sz
                </th>

                <th style={{ textAlign: "center", padding: "0.5rem" }}>
                  Agente
                </th>
                <th style={{ textAlign: "center", padding: "0.5rem" }}>
                  Cliente
                </th>
                <th style={{ textAlign: "center", padding: "0.5rem" }}>
                  Articolo
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "0.5rem",
                    width: "70px",
                  }}
                >
                  Q.tà
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.numOrdine ?? "N/A"}
                  </td>

                  {/* Sezione stretta centrata */}
                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.sezione}
                  </td>

                  <td style={{ textAlign: "center", padding: "0.5rem" }}>
                    {order.agente}
                  </td>

                  <td
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {order.cliente}
                  </td>

                  <td
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
          }}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default OrderListModal;
