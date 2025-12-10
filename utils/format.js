import moment from "moment";

function formatDate(date) {
  let m = moment(date);

  return m.format("DD/MM/YYYY HH:mm");
}

export { formatDate };
