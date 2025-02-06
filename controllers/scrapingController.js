const {
  scrapeProductList,
  deepseekAnalyzeService,
} = require("../services/index");
const { responseHelper, handleUrlParser } = require("../utils/index");

const scrapeProducts = async (req, res) => {
  const { limit_per_page, page, search } = req.query;

  try {
    const products = [];
    let notFound = true;
    let descriptionFailAttempt = 0;
    let AIAnalyzerFailAttempt = 0;

    for (let index = 1; index <= page; index++) {
      const url = handleUrlParser({
        limit_per_page,
        page: index,
        query: search,
      });
      console.log(`Fetching products from: ${url}`);

      const product = await scrapeProductList(url, limit_per_page);
      const productLists = product.productLists;

      console.log(product);

      if (product?.length > 0) {
        notFound = false; // At least one product was found
        console.log(`Fetched ${productLists?.length} products.`);
        products.push(...productLists);
        descriptionFailAttempt = product.descriptionFailAttempt;
      }
    }

    if (notFound) {
      console.log("❌ No products found on all pages.");
      return responseHelper.error(res, "No products found", 404);
    }

    console.log("🔍 Analyzing products with Deepseek...");
    await Promise.all(
      products.map(async (product, index) => {
        try {
          console.log(
            `⚡ [${index + 1}/${products.length}] Analyzing: ${product.name}`
          );
          product.analyzeAi = await deepseekAnalyzeService(product.name);
          console.log(`✅ Analysis complete: ${product.name}`);
        } catch (error) {
          console.error(`❌ Error analyzing product: ${product.name}`, error);
          product.analyzeAi = "-";
          AIAnalyzerFailAttempt++;
        }
      })
    );

    console.log("✅ Deepseek analysis completed.");

    const additionalRes = {
      descriptionFailAttempt,
      AIAnalyzerFailAttempt,
    };

    responseHelper.success({
      res,
      data: { products },
      pagination: { page, limit_per_page, totalData: products.length },
      additionalRes: additionalRes,
      message: "Retrieving products success",
    });
  } catch (error) {
    responseHelper.error(res, error.message);
  }
};

module.exports = { scrapeProducts };
