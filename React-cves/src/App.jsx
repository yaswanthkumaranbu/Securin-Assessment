import CVEList from "./First";
import Second from "./second";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/cves/list" />} />
          <Route path="/cves/list" element={<CVEList />} />
          <Route path="/cve/:cveId" element={<Second />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
