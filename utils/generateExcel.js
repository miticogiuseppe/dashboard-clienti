import * as XLSX from "xlsx";

const createExcelFile = () => {
  const data = [
    ["ID Ordine", "Data Ordine", "Cliente", "Prodotto", "Quantità", "Stato"],
    [1, "11/05/2025", "Mario Rossi", "Laptop", 1, "In lavorazione"],
    [2, "12/05/2025", "Anna Bianchi", "Smartphone", 2, "Spedito"],
    [3, "13/05/2025", "Luigi Verdi", "Monitor", 1, "Consegnato"],
    [4, "14/05/2025", "Carla Neri", "Tablet", 3, "Spedito"],
    [5, "15/05/2025", "Giorgio Bianchi", "Stampante", 1, "In lavorazione"],
    [6, "16/05/2025", "Sara Verdi", "Mouse", 4, "Consegnato"],
    [7, "17/05/2025", "Luca Ferri", "Tastiera", 2, "Spedito"],
    [8, "18/05/2025", "Elisa Fontana", "Router", 1, "In lavorazione"],
    [9, "19/05/2025", "Marco Greco", "Monitor", 1, "Consegnato"],
    [10, "20/05/2025", "Silvia Rizzo", "SSD", 2, "Spedito"],
    [11, "21/05/2025", "Fabio Moretti", "Cuffie", 1, "In lavorazione"],
    [12, "22/05/2025", "Daniela Russo", "Webcam", 3, "Consegnato"],
    [13, "23/05/2025", "Simone Galli", "Microfono", 2, "Spedito"],
    [14, "24/05/2025", "Giulia Esposito", "Hard Disk", 1, "Consegnato"],
    [15, "25/05/2025", "Paolo Mancini", "Caricabatterie", 1, "In lavorazione"]
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Ordini");

  // Salva il file localmente
  const filePath = "./orders.xlsx";
  XLSX.writeFile(wb, filePath);

  console.log(`✅ File Excel generato con successo: ${filePath}`);
};

createExcelFile();
