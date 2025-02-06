const puppeteer = require("puppeteer-extra");
const { Cluster } = require("puppeteer-cluster");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// scrape product list
const scrapeProductList = async (url, limit = 10) => {
  console.log("🚀 Launching Puppeteer...");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🔍 Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Check if the product is not found
  const isNotFound = await page.evaluate(() => {
    const noMatchElement = document.querySelector(
      ".srp-save-null-search__heading"
    );
    return noMatchElement?.innerText.includes("No exact matches found");
  });

  if (isNotFound) {
    console.log("❌ No products found.");
    await browser.close();
    return [];
  }

  console.log("📦 Extracting product list...");
  const productLists = await page.evaluate((limit) => {
    const productListings = Array.from(
      document.querySelectorAll(".s-item.s-item__pl-on-bottom")
    ).slice(2, parseInt(limit) + 2);

    return productListings.map((product, index) => ({
      index,
      name: product.querySelector(".s-item__title")?.innerText.trim() || "-",
      price: product.querySelector(".s-item__price")?.innerText.trim() || "-",
      image:
        product.querySelector(".s-item__image img")?.getAttribute("src") || "-",
      link: product.querySelector(".s-item__link")?.getAttribute("href") || "-",
      watchers:
        product
          .querySelector(".s-item__dynamic.s-item__watchCountTotal")
          ?.innerText.trim() || "-",
      sold:
        product
          .querySelector(".s-item__dynamic.s-item__quantitySold")
          ?.innerText.trim() || "-",
      from:
        product
          .querySelector(".s-item__location.s-item__itemLocation")
          ?.innerText?.trim()
          .replace(/^from\s+/i, "") || "-",
    }));
  }, limit);

  console.log(`✅ Extracted ${productLists.length} products.`);
  console.table(productLists);

  // Fetch product descriptions concurrently
  console.log("📥 Fetching product descriptions...");
  const detail = await scrapeProductDetail(
    productLists.map((product) => product.link)
  );

  console.log("🔗 Merging descriptions with product list...");
  productLists.forEach((product) => {
    const relatedProduct = detail.descriptions.find(
      (desc) => desc.url === product.link
    );
    product.description = relatedProduct ? relatedProduct.description : "-";
  });

  console.log("🚪 Closing Puppeteer...");
  await browser.close();

  console.log("🎉 Scraping completed.");
  console.log("");

  return { productLists, descriptionFailAttempt: detail.failedCount };
};

const scrapeProductDetail = async (urls) => {
  console.log("🚀 Starting Cluster...");
  console.log("");

  const descriptionResult = [];
  let failedCount = 0;

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 20, // Increased concurrency
    puppeteer,
    puppeteerOptions: {
      headless: true, // Run in headless mode for better performance
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Additional args for stability
    },
  });

  await cluster.task(async ({ page, data: url }) => {
    try {
      console.log(`🔍 Navigating to product page: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); // Faster than networkidle2

      console.log(`📌 Checking for iframe on ${url}`);
      const iframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector("#desc_ifr");
        return iframe ? iframe.getAttribute("src") : null;
      });

      let description = "-";

      if (iframeSrc) {
        console.log(`🔄 Navigating to iframe: ${iframeSrc}`);
        await page.goto(iframeSrc, {
          waitUntil: "domcontentloaded", // Faster than networkidle2
        });

        description = await page.evaluate(() => {
          const descElement = document.querySelector(
            ".x-item-description-child"
          );
          return descElement ? descElement.innerText.trim() : "tidak ada";
        });
      }

      console.log(`✅ Description fetched for ${url}`);
      descriptionResult.push({ url, description });
    } catch (error) {
      console.error(
        `❌ Error fetching description for ${url}: ${error.message}`
      );
      descriptionResult.push({
        url,
        description: "-",
      });
      failedCount++;
    }
  });

  urls.forEach((url) => {
    console.log(`🟢 Queuing URL: ${url}`);
    cluster.queue(url);
  });

  console.log("⏳ Processing all URLs...");
  console.log("");

  await cluster.idle();
  console.log("✅ All tasks completed.");

  await cluster.close();
  console.log("🚪 Cluster closed.");
  console.log("");

  return { descriptions: descriptionResult, failedCount };
};

// scrape product detail /
// const scrapeProductDetail = async (urls) => {
//   console.log("🚀 Starting Cluster...");
//   console.log("");

//   const descriptionResult = [];
//   let failedCount = 0;

//   const cluster = await Cluster.launch({
//     concurrency: Cluster.CONCURRENCY_PAGE,
//     maxConcurrency: 10,
//     puppeteer,
//     puppeteerOptions: {
//       headless: false,
//     },
//   });

//   await cluster.task(async ({ page, data: url }) => {
//     try {
//       console.log(`🔍 Navigating to product page: ${url}`);
//       await page.goto(url, { waitUntil: "networkidle2" });

//       console.log(`📌 Checking for iframe on ${url}`);
//       const iframeSrc = await page.evaluate(() => {
//         const iframe = document.querySelector("#desc_ifr");
//         return iframe ? iframe.getAttribute("src") : null;
//       });

//       let description = "-";

//       if (iframeSrc) {
//         console.log(`🔄 Navigating to iframe: ${iframeSrc}`);
//         await page.goto(iframeSrc, {
//           waitUntil: "networkidle2",
//         });

//         description = await page.evaluate(() => {
//           const descElement = document.querySelector(
//             ".x-item-description-child"
//           );
//           return descElement ? descElement.innerText.trim() : "tidak ada";
//         });
//       }

//       console.log(`✅ Description fetched for ${url}`);
//       descriptionResult.push({ url, description });
//     } catch (error) {
//       console.error(
//         `❌ Error fetching description for ${url}: ${error.message}`
//       );
//       descriptionResult.push({
//         url,
//         description: "-",
//       });
//       failedCount++;
//       throw error;
//     }
//   });

//   urls.forEach((url) => {
//     console.log(`🟢 Queuing URL: ${url}`);
//     console.log("");

//     cluster.queue(url);
//   });

//   console.log("⏳ Processing all URLs...");
//   console.log("");

//   await cluster.idle();
//   console.log("✅ All tasks completed.");

//   await cluster.close();
//   console.log("🚪 Cluster closed.");
//   console.log("");

//   return { descriptions: descriptionResult, failedCount };
// };

module.exports = scrapeProductList;

//   const cluster = await Cluster.launch({
//     concurrency: Cluster.CONCURRENCY_PAGE,
//     maxConcurrency: 4,
//     puppeteer,
//     puppeteerOptions: {
//       headless: false
//     }
//   });

//   await cluster.task(async ({ page, data: url }) => {
//     await page.goto(url);
//     const title = await page.title();
//     const safeFilename = url.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";
//     await page.screenshot({ path: `screenshots/${safeFilename}`, fullPage: false });
//     // console.log(`Judul halaman (${url}): ${title}`);
//   });

//   const urls = [
//     "https://bot.sannysoft.com/",
//     "https://example.com",
//     "https://news.ycombinator.com",
//     "https://github.com",
//   ];
// -
//   urls.forEach((url) => cluster.queue(url));

//   await cluster.idle();
//   await cluster.close();
