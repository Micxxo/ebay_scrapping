const express = require('express')
const scrapingRoute = require("./routes/scrapingRoute");
require('dotenv').config()

const app = express()
const APPLICATION_PORT = process.env.APP_PORT || 3000;
const APPLICATION_VERSION = process.env.VERIONING;

app.use(express.json())
app.use(`/api/${APPLICATION_VERSION}`, scrapingRoute);

app.listen(APPLICATION_PORT, () => {
    console.log('Server running on port ' + APPLICATION_PORT)
})  
