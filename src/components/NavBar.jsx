import { useState } from "react";
import { Link } from "react-router-dom";
import { Target, Info, Mail } from "lucide-react";
import "./style/Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Portfolio</Link>

      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/parmani">
            <Info className="icon" />
            <span className="link-text">Par Mani</span>
          </Link>
        </li>
        <li>
          <Link to="/projekti">
            <Target className="icon" />
            <span className="link-text">Projekti</span>
          </Link>
        </li>
        <li>
          <Link to="/kontakti">
            <Mail className="icon" />
            <span className="link-text">Kontakti</span>
          </Link>
        </li>
      </ul>

      <div 
        className={`hamburger ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}
