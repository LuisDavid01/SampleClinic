import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const redesSociales = [
    { icon: <Facebook size={20} />, name: "Facebook", url: "https://facebook.com/clinicafisiosalud" },
    { icon: <Instagram size={20} />, name: "Instagram", url: "https://instagram.com/clinicafisiosalud" },
    { icon: <Twitter size={20} />, name: "Twitter", url: "https://twitter.com/clinicafisiosalud" },
    { icon: <Linkedin size={20} />, name: "LinkedIn", url: "https://linkedin.com/company/clinicafisiosalud" },
    { icon: <Youtube size={20} />, name: "YouTube", url: "https://youtube.com/clinicafisiosalud" }
  ];

  const serviciosRapidos = [
    "Fisioterapia Deportiva",
    "Fisioterapia Neurológica",
    "Terapia Manual",
    "Fisioterapia Geriátrica",
    "Fisioterapia Ortopédica"
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Información de la Clínica */}
            <div className="footer-section">
              <h3>Clínica FisioSalud</h3>
              <p>
                Más de 15 años cuidando la salud y bienestar de nuestros pacientes 
                con tratamientos personalizados de fisioterapia.
              </p>
              <div className="footer-contact">
                <div className="contact-item">
                  <Phone size={16} />
                  <span>(506) 234 5678</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>info@clinicafisiosalud.com</span>
                </div>
                <div className="contact-item">
                  <MapPin size={16} />
                  <span>Calle 123 # 45-67, San José C.R.</span>
                </div>
              </div>
            </div>

            {/* Enlaces Rápidos */}
            <div className="footer-section">
              <h4>Enlaces Rápidos</h4>
              <ul className="footer-links">
                <li><a onClick={() => scrollToSection('servicios')}>Nuestros Servicios</a></li>
                <li><a onClick={() => scrollToSection('perfil')}>Perfil Profesional</a></li>
                <li><a onClick={() => scrollToSection('ubicacion')}>Ubicación</a></li>
                <li><a onClick={() => scrollToSection('agendar')}>Agendar Cita</a></li>
                <li><a onClick={() => scrollToSection('contacto')}>Contacto</a></li>
              </ul>
            </div>

            {/* Servicios */}
            <div className="footer-section">
              <h4>Servicios</h4>
              <ul className="footer-links">
                {serviciosRapidos.map((servicio, index) => (
                  <li key={index}>
                    <a onClick={() => scrollToSection('servicios')}>{servicio}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes Sociales */}
            <div className="footer-section">
              <h4>Síguenos</h4>
              <p>Mantente conectado con nosotros en redes sociales</p>
              <div className="redes-sociales">
                {redesSociales.map((red, index) => (
                  <a
                    key={index}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="red-social"
                    title={red.name}
                  >
                    {red.icon}
                  </a>
                ))}
              </div>
              
              <div className="newsletter">
                <h5>Suscríbete a nuestro boletín</h5>
                <p>Recibe consejos de salud y noticias de la clínica</p>
                <div className="newsletter-form">
                  <input 
                    type="email" 
                    placeholder="Tu email" 
                    className="newsletter-input"
                  />
                  <button className="btn-primary">Suscribirse</button>
                </div>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="footer-divider"></div>

          {/* Footer inferior */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2024 Clínica FisioSalud. Todos los derechos reservados.</p>
              <div className="footer-bottom-links">
                <a href="#" onClick={(e) => e.preventDefault()}>Política de Privacidad</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Términos de Servicio</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Política de Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de volver arriba */}
      <button className="scroll-to-top" onClick={scrollToTop}>
        ↑
      </button>
    </footer>
  );
};

export default Footer; 