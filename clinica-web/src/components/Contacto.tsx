import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

const Contacto: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Gracias por tu mensaje! Te responderemos pronto.');
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });
  };

  const contactInfo = [
    {
      icon: <Phone size={24} />,
      title: "Teléfono",
      info: ["(57) 1 234 5678", "(57) 300 123 4567"],
      action: "tel:+573001234567"
    },
    {
      icon: <Mail size={24} />,
      title: "Email",
      info: ["info@clinicafisiosalud.com", "citas@clinicafisiosalud.com"],
      action: "mailto:info@clinicafisiosalud.com"
    },
    {
      icon: <MapPin size={24} />,
      title: "Dirección",
      info: ["Calle 123 # 45-67, Local 2", "Barrio Centro, Bogotá D.C."],
      action: "#ubicacion"
    },
    {
      icon: <Clock size={24} />,
      title: "Horarios",
      info: ["Lun - Vie: 8:00 AM - 7:00 PM", "Sábados: 8:00 AM - 2:00 PM"],
      action: "#ubicacion"
    }
  ];

  return (
    <section id="contacto" className="contacto">
      <div className="container">
        <div className="section-header">
          <h2>Contáctanos</h2>
          <p>Estamos aquí para ayudarte. No dudes en contactarnos</p>
        </div>

        <div className="contacto-content">
          <div className="contacto-info">
            <h3>Información de Contacto</h3>
            <div className="contacto-grid">
              {contactInfo.map((contact, index) => (
                <div key={index} className="contacto-card">
                  <div className="contacto-icon">
                    {contact.icon}
                  </div>
                  <div className="contacto-details">
                    <h4>{contact.title}</h4>
                    {contact.info.map((info, infoIndex) => (
                      <p key={infoIndex}>{info}</p>
                    ))}
                  </div>
                  <a href={contact.action} className="contacto-action">
                    {contact.title === "Teléfono" ? "Llamar" : 
                     contact.title === "Email" ? "Enviar Email" : 
                     contact.title === "Dirección" ? "Ver Ubicación" : "Ver Horarios"}
                  </a>
                </div>
              ))}
            </div>

            <div className="contacto-rapido">
              <h3>Contacto Rápido</h3>
              <div className="contacto-buttons">
                <a href="tel:+573001234567" className="btn-primary">
                  <Phone size={16} />
                  Llamar Ahora
                </a>
                <a href="https://wa.me/573001234567" className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <MessageSquare size={16} />
                  WhatsApp
                </a>
                <a href="mailto:info@clinicafisiosalud.com" className="btn-secondary">
                  <Mail size={16} />
                  Enviar Email
                </a>
              </div>
            </div>
          </div>

          <div className="formulario-contacto">
            <h3>Envíanos un Mensaje</h3>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-nombre">Nombre Completo *</label>
                <input
                  type="text"
                  id="contact-nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email *</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-asunto">Asunto *</label>
                <input
                  type="text"
                  id="contact-asunto"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleInputChange}
                  required
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-mensaje">Mensaje *</label>
                <textarea
                  id="contact-mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  required
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                />
              </div>

              <button type="submit" className="btn-primary">
                <Send size={16} />
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

        <div className="preguntas-frecuentes">
          <h3>Preguntas Frecuentes</h3>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>¿Necesito una orden médica para recibir fisioterapia?</h4>
              <p>No siempre es necesario, pero recomendamos consultar con tu médico para obtener mejores resultados.</p>
            </div>
            <div className="faq-item">
              <h4>¿Cuánto dura una sesión de fisioterapia?</h4>
              <p>Las sesiones típicamente duran entre 45 minutos y 1 hora, dependiendo del tratamiento.</p>
            </div>
            <div className="faq-item">
              <h4>¿Aceptan seguros médicos?</h4>
              <p>Sí, trabajamos con varios seguros médicos. Contáctanos para verificar tu cobertura.</p>
            </div>
            <div className="faq-item">
              <h4>¿Qué debo traer a mi primera cita?</h4>
              <p>Ropa cómoda, estudios médicos previos si los tienes, y tu identificación.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto; 