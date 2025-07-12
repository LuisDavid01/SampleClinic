import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToServices = () => {
    const element = document.getElementById('servicios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Bienvenido a Clínica FisioSalud</h1>
        <p className="hero-subtitle">
          Cuidamos tu salud y bienestar con tratamientos personalizados de fisioterapia
        </p>
        <p className="hero-description">
          Nuestro equipo de profesionales especializados te ayudará a recuperar tu movilidad, 
          aliviar el dolor y mejorar tu calidad de vida con técnicas avanzadas y atención personalizada.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={scrollToServices}>
            Conoce Nuestros Servicios
          </button>
          <button className="btn-secondary" onClick={() => {
            const element = document.getElementById('agendar');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}>
            Agendar Cita
          </button>
        </div>
        <div className="hero-scroll" onClick={scrollToServices}>
          <ArrowDown size={24} />
          <span>Desliza para explorar</span>
        </div>
      </div>
      <div className="hero-background"></div>
    </section>
  );
};

export default Hero; 