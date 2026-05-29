import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Landing from "./pages/Landing.jsx";
import Form from "./pages/Form.jsx";
import Payment from "./pages/Payment.jsx";
import Report from "./pages/Report.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/form" element={<Form />} />
        <Route path="/payment/:analysisId" element={<Payment />} />
        <Route path="/report/:analysisId" element={<Report />} />
      </Routes>
    </div>
  );
}
