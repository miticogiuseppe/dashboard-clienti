import moment from "moment";

function formatDateTime(date) {
  let m = moment(date);

  return m.format("DD/MM/YYYY HH:mm");
}
function formatDate(date) {
  let m = moment(date);

  return m.format("DD/MM/YYYY");
}
function formatTime(date) {
  let m = moment(date);

  return m.format("HH:mm");
}

export { formatDateTime, formatDate, formatTime };
