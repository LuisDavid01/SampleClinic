import React from 'react';
import { Award, GraduationCap, Clock, Star } from 'lucide-react';

const PerfilProfesional: React.FC = () => {
  const profesionales = [
    {
      nombre: "Dr. Carlos Méndez",
      especialidad: "Fisioterapia Deportiva",
      experiencia: "15 años",
      formacion: "Universidad Nacional de Costa Rica",
      descripcion: "Especialista en rehabilitación deportiva con experiencia en equipos profesionales.",
      certificaciones: ["Fisioterapia Deportiva", "Terapia Manual", "Punción Seca"]
    },
    {
      nombre: "Dra. Ana Rodríguez",
      especialidad: "Fisioterapia Neurológica",
      experiencia: "12 años",
      formacion: "UNED",
      descripcion: "Experta en rehabilitación neurológica y tratamiento de pacientes con ACV.",
      certificaciones: ["Fisioterapia Neurológica", "Bobath", "Vojta"]
    },
    {
      nombre: "Dr. Miguel Torres",
      especialidad: "Fisioterapia Ortopédica",
      experiencia: "10 años",
      formacion: "Universidad de Costa Rica",
      descripcion: "Especialista en lesiones musculoesqueléticas y rehabilitación post-quirúrgica.",
      certificaciones: ["Fisioterapia Ortopédica", "Mulligan", "McKenzie"]
    }
  ];

  const estadisticas = [
    { icon: <Award size={24} />, numero: "5000+", texto: "Pacientes Atendidos" },
    { icon: <Clock size={24} />, numero: "15+", texto: "Años de Experiencia" },
    { icon: <GraduationCap size={24} />, numero: "20+", texto: "Certificaciones" },
    { icon: <Star size={24} />, numero: "98%", texto: "Satisfacción del Paciente" }
  ];

  return (
    <section id="perfil" className="perfil-profesional">
      <div className="container">
        <div className="section-header">
          <h2>Nuestro Equipo Profesional</h2>
          <p>Conoce a nuestros fisioterapeutas especializados comprometidos con tu recuperación</p>
        </div>

        <div className="estadisticas">
          {estadisticas.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-numero">{stat.numero}</div>
              <div className="stat-texto">{stat.texto}</div>
            </div>
          ))}
        </div>

        <div className="profesionales-grid">
          {profesionales.map((profesional, index) => (
            <div key={index} className="profesional-card">
              <div className="profesional-header">
                <h3>{profesional.nombre}</h3>
                <span className="especialidad">{profesional.especialidad}</span>
              </div>
              <div className="profesional-info">
                <p><strong>Experiencia:</strong> {profesional.experiencia}</p>
                <p><strong>Formación:</strong> {profesional.formacion}</p>
              </div>
              <p className="profesional-descripcion">{profesional.descripcion}</p>
              <div className="certificaciones">
                <h4>Certificaciones:</h4>
                <div className="certificaciones-tags">
                  {profesional.certificaciones.map((cert, certIndex) => (
                    <span key={certIndex} className="certificacion-tag">{cert}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="perfil-cta">
          <h3>¿Por qué elegirnos?</h3>
          <div className="razones">
            <div className="razon">
              <h4>Experiencia Comprobada</h4>
              <p>Más de 15 años de experiencia en el campo de la fisioterapia</p>
            </div>
            <div className="razon">
              <h4>Tecnología Avanzada</h4>
              <p>Utilizamos equipos de última generación para diagnósticos precisos</p>
            </div>
            <div className="razon">
              <h4>Atención Personalizada</h4>
              <p>Cada tratamiento es diseñado específicamente para tus necesidades</p>
            </div>
            <div className="razon">
              <h4>Resultados Garantizados</h4>
              <p>Compromiso con tu recuperación y mejora de calidad de vida</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerfilProfesional; 