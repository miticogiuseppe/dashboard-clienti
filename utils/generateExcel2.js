import * as XLSX from "xlsx";

const createExcelFile2 = () => {
    const data = [
        ["Prog", "Des. Agente", "Cli", "Ragione sociale", "Data ord", "Sez", "Nr.ord", "Articolo", "Descrizione", "Data Cons.", "Qta da ev", "QTAev II UM" ],
        [1, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "/M", "VETRATA FISSA C/VETRO STRAT.DI SIC.","",1, "" ],
        [2, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "TEMPRAVMAXVTCS", "VETRATA SERIE MAXIMA VETRO TEMPERATO","","8,6", "" ],
        [3, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "TEMPRAVMAXVTCS", "VETRATA SERIE MAXIMA","",1, "" ],
        [5, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "/M", "MAGGIORAZIONE VETRO SATINATO","",1, "" ],
        [5, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "/M", "KIT ANG.90°","",1, "" ],
        [6, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "TEMPRAVMAXVTCS", "VETRATA SERIE MAXIMA","",1, "" ],
        [7, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "/M", "MAGGIORAZIONE VETRO SATINATO","",1, "" ],
        [8, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "12/02/2025", 0, 368, "/M", "MONTAGGIO,RILIEVO MISURE,TRASPORTO","",1, "" ],
        [9, "GENERICO", 1, "CLIENTI AL DETTAGLIO", "14/02/2025", 0, 1167, "1013BATL401P", "ZANZ.VIRATA L42 PLUS LATERALE 1013","",1, "" ]
    ];


const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Ordini");

  // Salva il file localmente
  const filePath = "./orders.xlsx";
  XLSX.writeFile(wb, filePath);

  console.log(`✅ File Excel generato con successo: ${filePath}`);
};

createExcelFile2();