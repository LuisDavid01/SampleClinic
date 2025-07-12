import React from 'react';
import { Activity, Heart, Users, Zap, Shield, Target } from 'lucide-react';

const Servicios: React.FC = () => {
  const servicios = [
    {
      icon: <Activity size={40} />,
      title: "Fisioterapia Deportiva",
      description: "Tratamiento especializado para deportistas y lesiones deportivas, incluyendo rehabilitación y prevención.",
      color: "#3B82F6"
    },
    {
      icon: <Heart size={40} />,
      title: "Fisioterapia Cardiorrespiratoria",
      description: "Mejora la función pulmonar y cardiovascular con técnicas especializadas de fisioterapia.",
      color: "#EF4444"
    },
    {
      icon: <Users size={40} />,
      title: "Fisioterapia Neurológica",
      description: "Rehabilitación para pacientes con condiciones neurológicas como accidentes cerebrovasculares.",
      color: "#8B5CF6"
    },
    {
      icon: <Zap size={40} />,
      title: "Terapia Manual",
      description: "Técnicas manuales para aliviar el dolor y mejorar la movilidad articular.",
      color: "#F59E0B"
    },
    {
      icon: <Shield size={40} />,
      title: "Fisioterapia Geriátrica",
      description: "Cuidado especializado para adultos mayores, enfocado en mantener la independencia funcional.",
      color: "#10B981"
    },
    {
      icon: <Target size={40} />,
      title: "Fisioterapia Ortopédica",
      description: "Tratamiento de lesiones musculoesqueléticas, fracturas y problemas post-quirúrgicos.",
      color: "#EC4899"
    }
  ];

  return (
    <section id="servicios" className="servicios">
      <div className="container">
        <div className="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Ofrecemos una amplia gama de servicios de fisioterapia para cuidar tu salud y bienestar</p>
        </div>
        
        <div className="servicios-grid">
          {servicios.map((servicio, index) => (
            <div key={index} className="servicio-card" style={{ borderTopColor: servicio.color }}>
              <div className="servicio-icon" style={{ color: servicio.color }}>
                {servicio.icon}
              </div>
              <h3>{servicio.title}</h3>
              <p>{servicio.description}</p>
            </div>
          ))}
        </div>

        <div className="servicios-cta">
          <p>¿Necesitas un tratamiento específico? Consulta con nuestros especialistas</p>
          <button 
            className="btn-primary"
            onClick={() => {
              const element = document.getElementById('agendar');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Agendar Consulta
          </button>
        </div>
      </div>
    </section>
  );
};

export default Servicios; 