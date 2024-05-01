const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const cors = require("cors");
const { CVE } = require("./model/model");

const app = express();
const PORT = process.env.PORT || 5000;
const uri = "mongodb://localhost:27017/CVE";

app.use(cors());
app.use(express.json());

async function fetchCVEs(startIndex, resultsPerPage) {
  try {
    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=${startIndex}&resultsPerPage=${resultsPerPage}`,
      {
        maxContentLength: 100000000, // (100 MB)
      }
    );
    console.log("Data:" + JSON.stringify(response.data.startIndex));

    return response.data;
  } catch (error) {
    console.error("Error fetching CVE data:", error);
    throw error;
  }
}

async function startServer(startIndex, resultsPerPage) {
  try {
    const cveData = await fetchCVEs(startIndex, resultsPerPage);

    if (cveData && cveData.totalResults > 0) {
      const cves = cveData.vulnerabilities.map((vuln) => ({
        updateOne: {
          filter: { id: vuln.cve.id },
          update: vuln.cve,
          upsert: true,
        },
      }));

      await CVE.bulkWrite(cves, { strict: false });

      console.log(
        `Fetched CVEs from index ${startIndex} to ${
          startIndex + resultsPerPage - 1
        }`
      );
    } else {
      console.log("No more CVEs to fetch.");
    }
  } catch (error) {
    console.error("Failed to fetch or process CVEs:", error);
  }
}

async function main() {
  try {
    const totalRecords = await CVE.countDocuments({});
    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=0&resultsPerPage=1`
    );
    let totalResults = response.data.totalResults;
    for (let i = totalRecords - 1; i <= totalResults; i += 2000)
      await startServer(i, 2000);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function callFunctionAtMidnight() {
  // Get the current date and time
  const now = new Date();

  // Calculate the time until midnight (in milliseconds)
  const timeUntilMidnight =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Increment the date by 1 to represent the next day
      0, // Hour
      0, // Minute
      0 // Second
    ) - now;

  // Set a timeout to call the function at midnight
  setTimeout(function () {
    //Function for data synchronization into databse
    main();

    // recursive function for next day
    callFunctionAtMidnight();
  }, timeUntilMidnight);
}

// Initial call of function
main();
callFunctionAtMidnight();

// Route to retrieve data from MongoDB
app.get("/cves/list/:param1/:param2", async (req, res) => {
  try {
    const param1Value = parseInt(req.params.param1);
    const param2Value = parseInt(req.params.param2);
    // Fetch total count
    const totalRecords = await CVE.countDocuments({});
    const skip = param1Value * param2Value;
    const limit = param1Value * param2Value;

    // Fetch CVEs with limit
    const cves = await CVE.find({})
      .limit(100 + limit)
      .skip(skip);

    res.json({ totalRecords, cves });
  } catch (error) {
    console.error("Error fetching CVEs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/cves/list/:param1", async (req, res) => {
  try {
    const param1Value = parseInt(req.params.param1);
    // Fetch total count
    const totalRecords = await CVE.countDocuments({});

    // Fetch CVEs with limit
    const cves = await CVE.find({})
      .sort({ lastModified: -1 })
      .limit(param1Value);

    res.json({ totalRecords, cves });
  } catch (error) {
    console.error("Error fetching CVEs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/cves/:param", async (req, res) => {
  try {
    const paramValue = req.params.param;

    // Fetch CVEs with limit
    const cves = await CVE.find({ id: paramValue });

    res.json(cves);
  } catch (error) {
    console.error("Error fetching CVEs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

mongoose
  .connect(uri)
  .then(() => console.log("Mongo connected!"))
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
