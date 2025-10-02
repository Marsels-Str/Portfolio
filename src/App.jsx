import "./App.css";
import Home from "./components/Home";
import Navbar from "./components/NavBar";
import ParMani from "./components/ParMani";
import Kontakti from "./components/Kontakti";
import Projekti from "./components/Projekti";
import { Routes, Route } from "react-router-dom";
import useMouseSpotlight from "./components/SpotlightWrapper";
import CanvasBackground from "./components/CanvasBackground";

function App() {
  const { handleMouseMove } = useMouseSpotlight();

  return (
    <div
      style={{ position: "relative", minHeight: "100vh" }}
      onMouseMove={handleMouseMove}
    >
      <CanvasBackground particleCount={70} color="#38bdf8" />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/parmani" element={<ParMani />} />
          <Route path="/kontakti" element={<Kontakti />} />
          <Route path="/projekti" element={<Projekti />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
