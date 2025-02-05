require("dotenv").config();

const getURL = (query, limit, page) => {
  return `${process.env.BASE_URL}/i.html?_nkw=${query}&_sacat=0&_from=R40&_ipg=${limit}&_pgn=${page}`;
};

module.exports = { getURL };
