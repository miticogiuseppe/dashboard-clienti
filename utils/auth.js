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
    "statistiche_venduto",
  ],
  UFFICIO: [
    "dash_piena",
    "dash_generale",
    "dash_statistiche",
    "app_calendario",
    "venduto_globale",
    "venduto_agente",
    "statistiche_venduto",
  ],
  AGENTE: [
    "dash_piena",
    "dash_generale",
    "dash_statistiche",
    "app_calendario",
    "i_miei_clienti",
    "venduto_agente",
    "statistiche_venduto",
  ],
  CLIENTE: [
    "dash_generale", // Vede la sidebar e la cartella Dashboard
    "venduto_globale", // Vede la voce Venduto per il redirect
    "venduto_cliente",
  ],
};

// Funzione helper
export const canSee = (role, moduleName) => {
  if (role === "DIREZIONE") return true;
  return PERMISSIONS[role]?.includes(moduleName) || false;
};
