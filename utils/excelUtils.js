import * as XLSX from "xlsx";
import _ from "lodash";
import moment from "moment";

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

const loadOrdersFromExcel = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

const loadSheet = async (file, sheetName) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

const loadSheetFromUrl = async (url, sheetName) => {
  const response = await fetch(url);
  const data = await response.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

const parseDates = (jsonSheet, dateCols) => {
  let result = [];
  for (let row of jsonSheet)
    for (let dateCol of dateCols) {
      let newRow = _.cloneDeep(row);
      newRow[dateCol] = excelDateToMoment(newRow[dateCol]);
      result.push(newRow);
    }
  return result;
};
const orderSheet = (jsonSheet, keyCols, directions) => {
  return _.orderBy(jsonSheet, keyCols, directions);
};

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

//filtra per settimana
const filterByWeek = (
  data,
  dateCol,
  referenceDate = moment(),
  numberOfWeeks = 1
) => {
  const startOfWeek = referenceDate
    .clone()
    .add(-(numberOfWeeks - 1) * 7, "days")
    .startOf("week");
  const endOfWeek = referenceDate.clone().endOf("week");
  return data.filter(
    (row) =>
      row[dateCol].isSameOrAfter(startOfWeek) &&
      row[dateCol].isSameOrBefore(endOfWeek)
  );
};

const filterSheet = (sheet, column, value) => {
  if (!sheet || !Array.isArray(sheet)) return [];

  return sheet.filter((row) => {
    if (!(column in row)) return false;

    const cellValue = String(row[column]).trim().toLowerCase();
    const filterValue = String(value).trim().toLowerCase();

    return cellValue === filterValue;
  });
};

const filterByRange = (sheet, column, start, end) => {
  return _.filter(sheet, (row) => {
    const cellDate = row[column];
    return (
      cellDate.isSameOrAfter(start, "day") &&
      cellDate.isSameOrBefore(end, "day")
    );
  });
};

const extractValues = (data, col) => {
  return _.orderBy(
    _.filter(
      _.uniq(Object.keys(_.groupBy(data, (x) => x[col]))),
      (x) => x[col] !== ""
    )
  );
};

const sumByKey = (jsonSheet, groupKey, valueKey) => {
  const grouped = _.groupBy(jsonSheet, groupKey);
  return _.map(grouped, (items, key) => {
    return {
      [groupKey]: key,
      count: _.sumBy(items, (item) => Number(item[valueKey]) || 0),
    };
  });
};

export {
  loadOrdersFromExcel,
  loadSheet,
  sheetCount,
  excelDateToMoment,
  momentToExcelDate,
  parseDates,
  filterByWeek,
  orderSheet,
  extractValues,
  filterSheet,
  filterByRange,
  sumByKey,
  loadSheetFromUrl,
};
