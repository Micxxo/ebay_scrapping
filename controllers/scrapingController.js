const {
  scrapeProductList,
  scrapeProductDetail,
} = require("../services/index");
const { responseHelper, handleCalculatePages, handleUrlParser } = require("../utils/index");

const scrapeProducts = async (req, res) => {
  const { limit, page, search } = req.query;

  // const pageTest = handleCalculatePages(limit);

  // console.log(`page for index ${limit}: ${pageTest}`);

  try {
    const products = [];

    for (let index = 1; index <= page; index++) {
      const url = handleUrlParser({ limit, page: index, query: search });
      console.log(url);
      const product = await scrapeProductList(url, limit);
      products.push(...product);
    }

    responseHelper.success(
      res,
      { products: products },
      { page, limit, totalData: products.length },
      "Retriving products success"
    );
  } catch (error) {
    responseHelper.error(res, error.message);
  }
};

module.exports = { scrapeProducts };

// jika limit kurang dari sama dengan 60 dan page lebih dari 1
