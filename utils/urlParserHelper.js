const { getURL } = require("../config/index");

const handleUrlParser = (params) => {
  const { query, page, limit } = params;
  return getURL(query ?? "nike", Number(limit) ?? 60, Number(page) ?? 1);
};

module.exports = handleUrlParser;
