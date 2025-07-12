import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Clínica FisioSalud</h2>
        </div>
        
        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <a onClick={() => scrollToSection('servicios')} className="nav-link">Servicios</a>
          <a onClick={() => scrollToSection('perfil')} className="nav-link">Perfil Profesional</a>
          <a onClick={() => scrollToSection('ubicacion')} className="nav-link">Ubicación</a>
          <a onClick={() => scrollToSection('agendar')} className="nav-link">Agendar Cita</a>
          <a onClick={() => scrollToSection('contacto')} className="nav-link">Contacto</a>
        </div>

        <div className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 