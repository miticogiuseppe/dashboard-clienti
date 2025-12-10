import * as XLSX from "xlsx";
import _ from "lodash";
import moment from "moment";
import path from "path";

// funzioni di utilità non esportate
const excelDateToMoment = (excelDate) => {
  // Excel conta 1 come 1 gennaio 1900, ma ha il bug del 29/02/1900
  const baseDate = moment("1900-01-01");
  // Correzione bug Excel: se excelDate > 59, togliamo 1 giorno (29/02/1900 inesistente)
  const correction = excelDate > 59 ? -1 : 0;
  return baseDate.add(excelDate + correction - 1, "days"); // -1 perché 1 gennaio = 1
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
  for (let row of jsonSheet)
    for (let dateCol of dateCols) {
      let newRow = _.cloneDeep(row);
      if (typeof newRow[dateCol] === "number")
        newRow[dateCol] = excelDateToMoment(newRow[dateCol]);
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
  return _.filter(sheet, (row) => {
    const cellDate = row[column];
    return (
      cellDate.isSameOrAfter(start, "day") &&
      cellDate.isSameOrBefore(end, "day")
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
const sumByKey = (jsonSheet, groupKey, valueKey, fixEmpty = false) => {
  // 1. Caso: Calcola la somma totale (groupKey è null o undefined)
  if (!groupKey) {
    return _.sumBy(jsonSheet, (item) => Number(item[valueKey]) || 0);
  }

  // 2. Caso: Raggruppa per chiave (Comportamento originale)
  const grouped = _.groupBy(jsonSheet, groupKey);

  return _.map(grouped, (items, key) => {
    let computedKey = key;
    if (fixEmpty && !key) computedKey = "NO REFERENCE";

    return {
      [groupKey]: computedKey,
      count: _.sumBy(items, (item) => Number(item[valueKey]) || 0),
    };
  });
};

export {
  loadFirstSheet,
  loadSheet,
  sheetCount,
  excelDateToMoment,
  momentToExcelDate,
  parseDates,
  filterByWeek,
  orderSheet,
  extractUniques,
  filterByValue,
  filterByRange,
  sumByKey,
  loadSheetFromUrl,
};
