// Utenti di esempio per testare i ruoli e ciò che possono vedere
// export const MOCK_USERS = [
//   {
//     username: "direzione@copral.it",
//     password: "123",
//     role: "DIREZIONE",
//     nome: "Admin Copral",
//   },
//   {
//     username: "ufficio@copral.it",
//     password: "123",
//     role: "UFFICIO",
//     nome: "Staff Ufficio",
//   },
//   {
//     username: "agente08@copral.it",
//     password: "123",
//     role: "AGENTE",
//     codAgente: "08",
//     nome: "Agente 08",
//   },
//   {
//     username: "cliente@copral.it",
//     password: "123",
//     role: "CLIENTE",
//     codCliente: "C123",
//     nome: "Cliente Esempio",
//   },
// ];

// Mappa dei permessi per ogni ruolo
const PERMISSIONS = {
  DIREZIONE: [
    "dash_generale",
    "dash_statistiche",
    "app_calendario",
    "macchine_imballatrice",
    "macchine_troncatrice",
    "macchine_pulitrice",
    "macchine_intestatrice",
    "venduto_globale",
    "venduto_agente",
  ],
  UFFICIO: [
    "dash_generale",
    "dash_statistiche",
    "app_calendario",
    "venduto_globale",
    "venduto_agente",
  ],
  AGENTE: [
    "dash_generale",
    "app_calendario",
    "i_miei_clienti",
    "venduto_agente",
  ],
  CLIENTE: ["venduto_cliente"],
};

// Funzione helper
export const canSee = (role, moduleName) => {
  if (role === "DIREZIONE") return true;
  return PERMISSIONS[role]?.includes(moduleName) || false;
};
