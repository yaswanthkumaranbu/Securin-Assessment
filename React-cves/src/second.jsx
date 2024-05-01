import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

const Second = () => {
  const { cveId } = useParams();

  const [cves, setCVEs] = useState([]);

  // fetchData();

  // function fetchData() {
  //   fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0`)
  //     .then((data) => data.json())
  //     .then((obj) => {
  //       const cleanedData = obj.vulnerabilities;
  //       console.log(cleanedData);
  //       setTotalResults(obj.totalResults);
  //       setCVEs(cleanedData);
  //     });
  // }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/cves/${cveId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCVEs(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const style1 = { display: "flex" };
  const style2 = { paddingLeft: "5px" };

  return (
    <div>
      {cves.map((cve, index) => (
        <div key={index}>
          {cveId === cve.id && (
            <>
              <div className="container">
                <h3>{cve.id}</h3>
                <h5>Description</h5>
                <p>{cve.descriptions[0].value}</p>
                <h5>CVSS V2 Metrics:</h5>

                <div style={style1}>
                  <h6>Severity:</h6>
                  <p style={style2}>
                    {cve.metrics.cvssMetricV2[0].baseSeverity}
                  </p>
                </div>

                <div style={style1}>
                  <h6>Score:</h6>
                  <p style={style2}>
                    {cve.metrics.cvssMetricV2[0].cvssData.baseScore}
                  </p>
                </div>

                <div style={style1}>
                  <h6>Vector String:</h6>
                  <p style={style2}>
                    {cve.metrics.cvssMetricV2[0].cvssData.vectorString}
                  </p>
                </div>

                <table className="table table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Access Vector</th>
                      <th scope="col">Access Complexity</th>
                      <th scope="col">Authentication</th>
                      <th scope="col">Confidentiality Impact</th>
                      <th scope="col">Integrity Impact</th>
                      <th scope="col">Availability Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr key={index}>
                      <td>
                        {cve.metrics.cvssMetricV2[0].cvssData.accessVector}
                      </td>
                      <td>
                        {cve.metrics.cvssMetricV2[0].cvssData.accessComplexity}
                      </td>
                      <td>
                        {cve.metrics.cvssMetricV2[0].cvssData.authentication}
                      </td>
                      <td>
                        {
                          cve.metrics.cvssMetricV2[0].cvssData
                            .confidentialityImpact
                        }
                      </td>
                      <td>
                        {cve.metrics.cvssMetricV2[0].cvssData.integrityImpact}
                      </td>
                      <td>
                        {
                          cve.metrics.cvssMetricV2[0].cvssData
                            .availabilityImpact
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h5>Scores:</h5>

                <div style={style1}>
                  <h6>Exploitability Score:</h6>
                  <p style={style2}>
                    {cve.metrics.cvssMetricV2[0].exploitabilityScore}
                  </p>
                </div>

                <div style={style1}>
                  <h6>Impact Score:</h6>
                  <p style={style2}>
                    {cve.metrics.cvssMetricV2[0].impactScore}
                  </p>
                </div>

                <h5>CPE:</h5>
                <table className="table table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Criteria</th>
                      <th scope="col">Match Criteria ID</th>
                      <th scope="col">Vulnerable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cve.configurations[0].nodes[0].cpeMatch.map(
                      (val, index) => (
                        <tr key={index}>
                          <td>{val.criteria}</td>
                          <td>{val.matchCriteriaId}</td>
                          <td>{"" + val.vulnerable}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default Second;
