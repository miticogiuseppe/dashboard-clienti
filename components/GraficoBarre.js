import React from "react";

const GraficoBarre = ({ titolo, dati, ascisseLabel, ordinateLabel }) => {
  return (
    <div>
      <h5>{titolo}</h5>
      <table>
        <thead>
          <tr>
            <th>{ascisseLabel}</th>
            <th>{ordinateLabel}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dati).map(([categoria, quantita]) => (
            <tr key={categoria}>
              <td>{categoria}</td>
              <td>{quantita}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GraficoBarre;
