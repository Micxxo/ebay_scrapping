# Ebay Scraping With Deepseek AI Integration

This project is a web scraping application designed to **extract product details from eBay** using Express.js as the backend framework and Puppeteer as the web scraping tool.

## Installation

Install my project with npm

1.) Clone Repository

```bash
  git clone https://github.com/Micxxo/ebay_scrapping.git
  cd ebay_scrapping
```

2.) Intsall dependencies with NPM

```bash
  npm install .
```

3.) Setup LM Studio and Deepseek Model

- Download and install [LM Studio](https://lmstudio.ai/)
- Open LM Studio, then search and download for model deepseek-coder-v2-lite-instruct
- Open developer page on sidebar load the model and start the server
- Use default LM Studi endpoint:
  ```bash
  http://127.0.0.1:1234
  ```

4.) Setup Environment Variables

```bash
APP_PORT → The port number where the Express.js application runs.
BASE_URL → The base URL, received from eBay.
VERSIONING → Defines the API versioning strategy (e.g., v1, v2).
LM_STUDIO_API_URL → The endpoint from LM Studio.
```

5.) Start Server

```bash
  npm run dev
```

## Features

- Comprehensive eBay Scraping – Extract detailed product information, including titles, prices, descriptions and more.
- AI-Powered Product Analysis – Leverage Deepseek AI for intelligent product insights based on market needs.

- Seamless Pagination Handling – Efficiently scrape products across multiple pages while respecting custom limits per page.

## API Reference

#### Get Products

```http
  GET /api/v1/ebay
```

| Parameter        | Type     | Description                                                                                                                 |
| :--------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `search`         | `string` | **optional**. The search keyword used to find products on eBay. If not provided, a default value (e.g., "nike") is used.    |
| `page`           | `string` | **optional**. The page number to scrape. Determines which set of results to fetch from eBay's search results. Default is 1. |
| `limit_per_page` | `string` | **optional**. The number of products to scrape per page. Default is 60, but can be adjusted to fit specific needs.          |

## Screenshots

[Scrape 1 page with 60 datas](https://drive.google.com/file/d/1QG_h27pC7fnjRql6XtQRlqsM13A5Nria/view?usp=drive_link)
