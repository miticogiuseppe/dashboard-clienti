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
          maxWidth: "600px",
          maxHeight: "80vh", // Limita l'altezza massima per evitare overflow
          overflowY: "auto", // Abilita lo scroll verticale
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
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            display: "block",
            maxHeight: "60vh",
            overflowY: "auto",
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
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: "0.5rem",
                }}
              >
                Cliente
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: "0.5rem",
                }}
              >
                Quantità
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: "0.5rem",
                }}
              >
                Sezione
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: "0.5rem",
                }}
              >
                Agente
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, idx) => (
              <tr key={idx}>
                <td>{order.cliente}</td>
                <td>{order.quantità}</td>
                <td>{order.sezione}</td>
                <td>{order.agente}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
