import React, { useState, useEffect } from "react";
import "./App.css";

function CVEList() {
  const [pageNumber, setPageNumber] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [lastModified, setLastModified] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [cves, setCVEs] = useState([]);
  const [cvesCopy, setCVEsCopy] = useState(cves);
  const [isChecked, setIsChecked] = useState(false);

  const [filter, setFilter] = useState("");

  const fetchData = async (pageNumber, resultsPerPage) => {
    try {
      const response = await fetch(
        `http://localhost:5000/cves/list/${pageNumber - 1}/${resultsPerPage}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const { totalRecords, cves } = data;
      setTotalResults(totalRecords);
      const slicedData = cves.slice(
        (pageNumber - 1) * resultsPerPage,
        resultsPerPage * pageNumber
      );
      setCVEs(slicedData);
      setCVEsCopy(slicedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // Call fetchData function inside useEffect
    fetchData(pageNumber, resultsPerPage);
  }, [pageNumber, resultsPerPage]);

  const LastModified = async (lastModified) => {
    try {
      const response = await fetch(
        `http://localhost:5000/cves/list/${lastModified}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const { totalRecords, cves } = data;
      setTotalResults(totalRecords);
      setCVEs(cves);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function renderPagination() {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const maxPageButtons = 5;
    let startPage = Math.max(1, pageNumber - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    let pagination = [];
    pagination.push(
      <li
        key="prev"
        className={`page-item ${pageNumber === 1 ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Previous
        </button>
      </li>
    );
    for (let i = startPage; i <= endPage; i++) {
      pagination.push(
        <li key={i} className={`page-item ${pageNumber === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPageNumber(i)}>
            {i}
          </button>
        </li>
      );
    }
    pagination.push(
      <li
        key="next"
        className={`page-item ${pageNumber === totalPages ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next
        </button>
      </li>
    );
    return pagination;
  }

  return (
    <>
      <div className="container">
        <h2 style={{ display: "flex", justifyContent: "center" }}>CVE LIST</h2>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div id="total">
            <h6>Total Records: {totalResults}</h6>
          </div>
          <div className="col-md-6">
            <div className="form-group d-flex  justify-content-end">
              <input
                type="checkbox"
                id="myCheckbox"
                name="myCheckbox"
                checked={isChecked}
                onChange={async (e) => {
                  const newCheckedState = e.target.checked; // Toggle the isChecked state
                  setIsChecked(newCheckedState); // Update isChecked state

                  if (!newCheckedState) {
                    // Perform actions when checkbox is unchecked
                    await fetchData(pageNumber, resultsPerPage);
                  }
                  if (newCheckedState) {
                    // Perform actions when checkbox is checked
                    setLastModified(lastModified); // Example action
                    LastModified(lastModified);
                    // fetchData(pageNumber, resultsPerPage);
                  }
                }}
              />

              <label htmlFor="recordsPerPageSelect" className="p-1">
                Last modified records :
              </label>
              <select
                style={{ width: "100px" }}
                className="form-select form-select-sm"
                id="recordsPerPageSelect"
                value={lastModified}
                onChange={async (e) => {
                  const value = parseInt(e.target.value);
                  if (isChecked) {
                    // Check if the parsed value is not NaN
                    setLastModified(value);
                    await LastModified(value);
                  } else {
                    // Handle the case when the value is not a valid number
                    console.error("Invalid value entered.");
                  }
                }}
              >
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
        <br></br>

        <div className="table-container">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th scope="col">CVE ID</th>
                <th scope="col">IDENTIFIER</th>
                <th scope="col">PUBLISHED DATE</th>
                <th scope="col">LAST MODIFIED DATE</th>
                <th scope="col">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {cves.length != 0 &&
                cves.map((val, index) => (
                  <tr key={index}>
                    <td>
                      <a
                        href={`/cve/${val.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {val.id}
                      </a>
                    </td>
                    <td>{val.sourceIdentifier}</td>
                    <td>{val.published}</td>
                    <td>{val.lastModified}</td>
                    <td>{val.vulnStatus}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <br></br>
        {!isChecked && (
          <div className="row">
            <div className="col-md-6">
              <div className="form-group d-flex">
                <label htmlFor="recordsPerPageSelect" className="p-1">
                  Records Per Page:
                </label>
                <select
                  style={{ width: "100px" }}
                  className="form-select form-select-sm"
                  id="recordsPerPageSelect"
                  value={resultsPerPage}
                  onChange={(e) => setResultsPerPage(parseInt(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <nav aria-label="Page navigation example">
                <div className="d-flex justify-content-end align-items-center">
                  <div id="record-range" className="text-center m-0 p-1">
                    Showing {(pageNumber - 1) * resultsPerPage + 1}-
                    {Math.min(pageNumber * resultsPerPage, totalResults)} of{" "}
                    {totalResults} records
                  </div>
                  <ul className="pagination m-0 p-0">{renderPagination()}</ul>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CVEList;
