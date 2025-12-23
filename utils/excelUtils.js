import * as XLSX from "xlsx";
import _ from "lodash";
import moment from "moment";
import path from "path";

// funzioni di utilità non esportate
const excelDateToMoment = (excelDateTime) => {
  // 1. DATA (Parte Intera)
  const excelDate = Math.floor(excelDateTime); // Parte intera = numero di giorni

  // Excel conta 1 come 1 gennaio 1900
  let baseDate = moment("1900-01-01");

  // Correzione bug Excel: se excelDate > 59, togliamo 1 giorno (29/02/1900 inesistente)
  const correction = excelDate > 59 ? -1 : 0;

  // Applica i giorni (inclusa la correzione)
  baseDate.add(excelDate + correction - 1, "days");

  // 2. ORA (Parte Frazionaria)
  const excelTimeFraction = excelDateTime - excelDate; // Parte decimale = frazione del giorno

  // 3. Conversione della Frazione in Millisecondi
  // Un giorno ha 86400 secondi (24 * 60 * 60)
  // Un giorno ha 86400000 millisecondi (86400 * 1000)
  const millisecondsInDay = 86400000;
  const totalMilliseconds = excelTimeFraction * millisecondsInDay;

  // Aggiunge i millisecondi calcolati all'oggetto moment
  return baseDate.add(totalMilliseconds, "milliseconds");
};
const excelDateToMomentDuration = (excelDateTime) => {
  const excelDate = Math.floor(excelDateTime);

  const excelTimeFraction = excelDateTime - excelDate;

  const millisecondsInDay = 86400000;
  const totalMilliseconds = excelTimeFraction * millisecondsInDay;

  return moment.duration(totalMilliseconds);
};
const momentToExcelDate = (momentObj) => {
  const baseDate = moment("1900-01-01");
  let diff = momentObj.diff(baseDate, "days") + 1; // +1 perché Excel inizia da 1
  // Correzione bug 29/02/1900
  if (diff >= 60) diff += 1;
  return diff;
};

// Legge il primo foglio di un file Excel e produce in output un json.
// legge da un percorso del file system
const loadFirstSheet = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

// Legge uno specifico foglio di un file Excel e produce in output un json.
// legge da un percorso del file system
const loadSheet = async (file, sheetName) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

// Legge uno specifico foglio di un file Excel e produce in output un json.
// legge da un URL
const loadSheetFromUrl = async (url, sheetName) => {
  const response = await fetch(url);
  const data = await response.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

const loadSheetFromFile = (relativePath, sheetName) => {
  const filePath = path.resolve(process.env.DRIVE_PATH, relativePath);
  const data = fs.readFileSync(filePath);
  const workbook = XLSX.read(data, { type: "buffer" });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

// Specificando le colonne che contengono date, è possibile parsare tutte le date automaticamente.
const parseDates = (jsonSheet, dateCols) => {
  let result = [];
  for (let row of jsonSheet) {
    let newRow = _.cloneDeep(row);
    for (let dateCol of dateCols)
      if (typeof newRow[dateCol] === "number")
        newRow[dateCol] = excelDateToMoment(newRow[dateCol]);
    result.push(newRow);
  }
  return result;
};
const parseTimes = (jsonSheet, dateCols) => {
  let result = [];
  for (let row of jsonSheet) {
    let newRow = _.cloneDeep(row);
    for (let dateCol of dateCols)
      if (typeof newRow[dateCol] === "number")
        newRow[dateCol] = excelDateToMomentDuration(newRow[dateCol]);
    result.push(newRow);
  }
  return result;
};
const parseDatesString = (jsonSheet, dateCols, formatString) => {
  let result = [];
  for (let row of jsonSheet) {
    let newRow = _.cloneDeep(row);
    for (let dateCol of dateCols)
      newRow[dateCol] = moment(newRow[dateCol], formatString);
    result.push(newRow);
  }
  return result;
};

// Permette di ordinare in base alle colonne chiave specificate.
const orderSheet = (jsonSheet, keyCols, directions) => {
  return _.orderBy(jsonSheet, keyCols, directions);
};

// Conta valori univoci sulla base delle colonne chiave.
const sheetCount = (jsonSheet, keyCols) => {
  const gruppi = _.groupBy(jsonSheet, (item) => {
    let key = "";
    for (let keyCol of keyCols) key += item[keyCol] + "§";
    return key;
  });
  const risultati = _.map(gruppi, (items, chiave) => {
    let obj = {};
    for (let i = 0; i < keyCols.length; i++)
      obj[keyCols[i]] = items[0][keyCols[i]];
    obj.count = items.length;
    return obj;
  });
  return risultati;
};

// Filtra righe per settimana.
// Specificare una colonna data, la data di riferimento e di quante settimane
// si vuole guardare a ritorso.
const filterByWeek = (
  jsonSheet,
  dateCol,
  referenceDate = moment(),
  numberOfWeeks = 1
) => {
  const startOfWeek = referenceDate
    .clone()
    .add(-(numberOfWeeks - 1) * 7, "days")
    .startOf("week");
  const endOfWeek = referenceDate.clone().endOf("week");
  return jsonSheet.filter(
    (row) =>
      row[dateCol].isSameOrAfter(startOfWeek) &&
      row[dateCol].isSameOrBefore(endOfWeek)
  );
};

// Filtra righe in base a un range di date.
// Specificare la colonna data e il range.
const filterByRange = (sheet, column, start, end) => {
  end.add(1, "days");
  return _.filter(sheet, (row) => {
    const cellDate = row[column];
    return (
      moment.isMoment(cellDate) &&
      cellDate.isSameOrAfter(start, "day") &&
      cellDate.isBefore(end, "day")
    );
  });
};

// Filtra righe in base a un valore.
// Specificare una colonna da comparare e il valore per il confronto.
const filterByValue = (sheet, column, value) => {
  if (!sheet || !Array.isArray(sheet)) return [];

  return sheet.filter((row) => {
    if (!(column in row)) return false;

    const cellValue = String(row[column]).trim().toLowerCase();
    const filterValue = String(value).trim().toLowerCase();

    return cellValue === filterValue;
  });
};

// Estrae tutti i valori univoci da una colonna.
const extractUniques = (data, col) => {
  return _.orderBy(
    _.filter(
      _.uniq(Object.keys(_.groupBy(data, (x) => x[col]))),
      (x) => x[col] !== ""
    )
  );
};

// Funzione affine a una GROUP BY.
// Raggruppa in base a groupKey, effettua la sommatoria di valueKey per ogni gruppo.
const sumByKey = (
  jsonSheet,
  groupKey,
  valueKey,
  fixEmpty = false,
  convertCb = undefined
) => {
  const getValue = (item) => {
    let value = item ? (convertCb ? convertCb(item) : Number(item)) : 0;
    return value;
  };

  // 1. Caso: Calcola la somma totale (groupKey è null o undefined)
  if (!groupKey) {
    return _.sumBy(jsonSheet, (item) =>
      valueKey ? getValue(item[valueKey]) : 1
    );
  }

  // 2. Caso: Raggruppa per chiave (Comportamento originale)
  const grouped = _.groupBy(jsonSheet, groupKey);

  return _.map(grouped, (items, key) => {
    let computedKey = key;
    if (fixEmpty && !key) computedKey = "NO REFERENCE";

    return {
      [groupKey]: computedKey,
      count: _.sumBy(items, (item) =>
        valueKey ? getValue(item[valueKey]) : 1
      ),
    };
  });
};

/**
 * Converte un numero decimale Excel (frazione di giorno) in formato HH:mm:ss.
 * Esempio: 0.117118055553874 -> 02:48:40 (circa)
 * @param {number|string} excelDuration - Il valore numerico di durata da Excel.
 * @returns {string} Durata formattata come HH:mm:ss.
 */
const formatExcelTimeDuration = (excelDuration) => {
  let value = Number(excelDuration);
  if (isNaN(value) || value <= 0) {
    return "00:00:00";
  }

  const SECONDS_IN_DAY = 86400; // 24 * 60 * 60

  // 1. Converti la frazione di giorno in secondi totali
  const totalSeconds = Math.round(value * SECONDS_IN_DAY);

  // 2. Calcola ore, minuti e secondi
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  // 3. Formatta in stringa HH:mm:ss con padding
  const pad = (num) => String(num).padStart(2, "0");

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/**
 * Funzione di supporto per ottenere solo i secondi totali (utile per calcoli/grafici)
 */
const getSecondsFromExcelTime = (excelDuration) => {
  let value = Number(excelDuration);
  if (isNaN(value) || value <= 0) return null;
  const SECONDS_IN_DAY = 86400;
  return Math.round(value * SECONDS_IN_DAY);
};

export {
  loadFirstSheet,
  loadSheet,
  sheetCount,
  excelDateToMoment,
  momentToExcelDate,
  parseDates,
  parseTimes,
  filterByWeek,
  orderSheet,
  extractUniques,
  filterByValue,
  filterByRange,
  sumByKey,
  loadSheetFromUrl,
  parseDatesString,
  formatExcelTimeDuration,
  getSecondsFromExcelTime,
};
