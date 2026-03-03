// Configurazione delle colonne per la tabella delle statistiche di vendita (Mock Data)
export const copralMockData = [
  {
    agente: "BILARDO ANTONIO",
    totaleAgente: {
      acc_val: 301258.77,
      acc_qty: 172684,
      alm_val: 611799.12,
      alm_qty: 85127,
    },
    clienti: [
      {
        nome: "ACESE SERRAMENTI PICCOLA SOCIETA'",
        accessori: { valore: 94.72, qta: 6 },
        alluminio: { valore: 396.73, qta: 58 },
      },
      {
        nome: "ALUFORM SERRAMENTI DI DAVIDE PAPA",
        accessori: { valore: 4532.54, qta: 3830 },
        alluminio: { valore: 17561.9, qta: 2490 },
      },
    ],
  },
  {
    agente: "ROSSI GIUSEPPE",
    totaleAgente: {
      acc_val: 45200.5,
      acc_qty: 12400,
      alm_val: 98300.0,
      alm_qty: 15200,
    },
    clienti: [
      {
        nome: "FERRAMENTA ETNEA",
        accessori: { valore: 1200.0, qta: 450 },
        alluminio: { valore: 5600.0, qta: 1100 },
      },
    ],
  },
];
