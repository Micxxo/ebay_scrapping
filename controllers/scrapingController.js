const {
  scrapeProductList,
  deepseekAnalyzeService,
} = require("../services/index");
const { responseHelper, handleUrlParser } = require("../utils/index");

const scrapeProducts = async (req, res) => {
  const { limit_per_page = "60", page = "1", search = "nike" } = req.query;
  const pageNumber = parseInt(page, 10);
  const limit = parseInt(limit_per_page, 10);

  try {
    console.log(
      `🚀 Scraping started for search: "${search}" | Pages: ${pageNumber} | Limit per page: ${limit}`
    );

    let products = [];
    let descriptionFailAttempt = 0;
    let AIAnalyzerFailAttempt = 0;

    // ✅ Parallelized fetching of product lists
    const scrapeResults = await Promise.allSettled(
      Array.from({ length: pageNumber }, async (_, index) => {
        const url = handleUrlParser({ limit, page: index + 1, query: search });
        console.log(`🔎 Fetching products from: ${url}`);

        try {
          const productData = await scrapeProductList(url, limit);
          if (productData?.productLists?.length > 0) {
            console.log(
              `✅ Page ${index + 1}: Fetched ${
                productData.productLists.length
              } products.`
            );
            descriptionFailAttempt += productData.descriptionFailAttempt;
            return productData.productLists;
          } else {
            console.warn(`⚠️ Page ${index + 1}: No products found.`);
            return [];
          }
        } catch (error) {
          console.error(`❌ Error fetching page ${index + 1}:`, error.message);
          return [];
        }
      })
    );

    // ✅ Merge results
    products = scrapeResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    if (products.length === 0) {
      console.warn("❌ No products found on all pages.");
      return responseHelper.notFound(res, "No products found");
    }

    console.log(`📦 Total products fetched: ${products.length}`);

    // ✅ AI Analysis with proper error handling
    console.log("🔍 Starting Deepseek AI Analysis...");
    await Promise.allSettled(
      products.map(async (product, index) => {
        try {
          console.log(
            `⚡ [${index + 1}/${products.length}] Analyzing: ${product.name}`
          );
          product.analyzeAi = await deepseekAnalyzeService(product.name);
          console.log(`✅ Analysis complete: ${product.name}`);
        } catch (error) {
          console.error(
            `❌ Error analyzing product: ${product.name}`,
            error.message
          );
          product.analyzeAi = "-";
          AIAnalyzerFailAttempt++;
        }
      })
    );

    console.log(
      `✅ Deepseek Analysis Completed. Failed Attempts: ${AIAnalyzerFailAttempt}`
    );

    responseHelper.success({
      res,
      data: { products },
      pagination: {
        page: pageNumber,
        limit_per_page: limit,
        totalData: products.length,
      },
      additionalRes: { descriptionFailAttempt, AIAnalyzerFailAttempt },
      message: "Retrieving products success",
    });
  } catch (error) {
    console.error("🚨 Fatal Error in scrapeProducts:", error.message);
    responseHelper.error(res, error.message);
  }
};

module.exports = { scrapeProducts };
