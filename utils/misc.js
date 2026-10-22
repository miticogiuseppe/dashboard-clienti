// utils/misc.js

export function buildTableName(tenant, id) {
  return (tenant + "__" + id).toLowerCase().replaceAll("-", "_");
}
