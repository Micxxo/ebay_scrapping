const puppeteer = require("puppeteer-extra");
const { Cluster } = require("puppeteer-cluster");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const scrapeProductList = async (url, limit = 10) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const productLists = await page.evaluate((limit) => {
    const productListings = Array.from(
      document.querySelectorAll(".s-item.s-item__pl-on-bottom")
    ).slice(2, parseInt(limit) + 2);

    return productListings.map((product, index) => {
      return {
        index,
        name: product.querySelector(".s-item__title")?.innerText.trim() || "-",
        price: product.querySelector(".s-item__price")?.innerText.trim() || "-",
        image:
          product.querySelector(".s-item__image img")?.getAttribute("src") ||
          "-",
        link:
          product.querySelector(".s-item__link")?.getAttribute("href") || "-",
      };
    });
  }, limit);

  // get description
  const detail = await scrapeProductDetail(
    productLists.map((product) => product.link),
    limit
  );

  productLists.forEach((product) => {
    const relatedProduct = detail.find(
      (desc) => desc.url === product.link
    );
    if (relatedProduct) product.description = relatedProduct.description;
  });

  await browser.close();
  return productLists;
};

const scrapeProductDetail = async (url, limit) => {
  const descriptionResult = [];

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: parseInt(limit) > 10 ? 10 : parseInt(limit),
    puppeteer,
    puppeteerOptions: {
      headless: false,
    },
  });

  await cluster.task(async ({ page, data: url }) => {
    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      const iframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector("#desc_ifr");
        return iframe ? iframe.getAttribute("src") : null;
      });

      let description = "-";

      if (iframeSrc) {
        await page.goto(iframeSrc, { waitUntil: "networkidle2" });
        description = await page.evaluate(() => {
          const descElement = document.querySelector(
            ".x-item-description-child"
          );
          return descElement ? descElement.innerText.trim() : "tidak ada";
        });
      }

      descriptionResult.push({ url, description });
    } catch (error) {
      console.error(`Error fetching description for ${url}: ${error}`);
      results.push({ url, description: error });
    }
  });

  const urls = url;
  urls.forEach((url) => cluster.queue(url));

  await cluster.idle();
  await cluster.close();

  return descriptionResult;
};

module.exports = scrapeProductList 

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
