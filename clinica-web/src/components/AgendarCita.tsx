import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';

const AgendarCita: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    servicio: '',
    mensaje: ''
  });

  const servicios = [
    "Fisioterapia Deportiva",
    "Fisioterapia Cardiorrespiratoria",
    "Fisioterapia Neurológica",
    "Terapia Manual",
    "Fisioterapia Geriátrica",
    "Fisioterapia Ortopédica",
    "Consulta General"
  ];

  const horarios = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la información a un backend
    alert('¡Gracias! Tu cita ha sido programada. Te contactaremos pronto para confirmar.');
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      fecha: '',
      hora: '',
      servicio: '',
      mensaje: ''
    });
  };

  return (
    <section id="agendar" className="agendar-cita">
      <div className="container">
        <div className="section-header">
          <h2>Agenda tu Cita</h2>
          <p>Programa tu consulta de fisioterapia de manera fácil y rápida</p>
        </div>

        <div className="agendar-content">
          <div className="agendar-info">
            <div className="info-section">
              <h3>¿Por qué agendar con nosotros?</h3>
              <div className="beneficios">
                <div className="beneficio">
                  <div className="beneficio-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="beneficio-content">
                    <h4>Agenda Flexible</h4>
                    <p>Horarios disponibles de lunes a sábado</p>
                  </div>
                </div>
                <div className="beneficio">
                  <div className="beneficio-icon">
                    <Clock size={24} />
                  </div>
                  <div className="beneficio-content">
                    <h4>Atención Puntual</h4>
                    <p>Respetamos tu tiempo con citas programadas</p>
                  </div>
                </div>
                <div className="beneficio">
                  <div className="beneficio-icon">
                    <User size={24} />
                  </div>
                  <div className="beneficio-content">
                    <h4>Atención Personalizada</h4>
                    <p>Cada sesión es diseñada específicamente para ti</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Información Importante</h3>
              <div className="informacion-importante">
                <ul>
                  <li>Llega 10 minutos antes de tu cita</li>
                  <li>Trae ropa cómoda para la sesión</li>
                  <li>Si es tu primera visita, trae estudios médicos previos</li>
                  <li>Cancelaciones con 24 horas de anticipación</li>
                  <li>Aceptamos seguros médicos</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="formulario-container">
            <form onSubmit={handleSubmit} className="formulario-cita">
              <div className="form-group">
                <label htmlFor="nombre">
                  <User size={16} />
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">
                  <Phone size={16} />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  placeholder="(506) 123 4567"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fecha">
                    <Calendar size={16} />
                    Fecha Preferida *
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hora">
                    <Clock size={16} />
                    Hora Preferida *
                  </label>
                  <select
                    id="hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una hora</option>
                    {horarios.map((hora, index) => (
                      <option key={index} value={hora}>{hora}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="servicio">
                  <MessageSquare size={16} />
                  Servicio de Interés *
                </label>
                <select
                  id="servicio"
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map((servicio, index) => (
                    <option key={index} value={servicio}>{servicio}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">
                  <MessageSquare size={16} />
                  Mensaje (Opcional)
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  placeholder="Describe brevemente tu condición o motivo de consulta..."
                  rows={4}
                />
              </div>

              <button type="submit" className="btn-primary btn-agendar">
                Agendar Cita
              </button>
            </form>
          </div>
        </div>

        <div className="contacto-rapido">
          <h3>¿Necesitas ayuda?</h3>
          <p>También puedes contactarnos directamente:</p>
          <div className="contacto-opciones">
            <a href="tel:+5061234567" className="btn-secondary">
              <Phone size={16} />
              Llamar Ahora
            </a>
            <a href="https://wa.me/+5061234567" className="btn-secondary" target="_blank" rel="noopener noreferrer">
              <MessageSquare size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgendarCita; 