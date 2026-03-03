export const checkRow = (row, column, searchData) => {
  if (searchData?.selected) {
    return String(row[column]) === String(searchData.selected);
  } else if (row[column] && searchData?.search) {
    return String(row[column])
      .toLowerCase()
      .includes(String(searchData.search).toLowerCase());
  }
  return true;
};
