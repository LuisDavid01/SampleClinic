import React from 'react';
import { MapPin, Clock, Phone, Mail, Car, Bus } from 'lucide-react';

const Ubicacion: React.FC = () => {
  const horarios = [
    { dia: "Lunes - Viernes", horario: "8:00 AM - 7:00 PM" },
    { dia: "Sábados", horario: "8:00 AM - 2:00 PM" },
    { dia: "Domingos", horario: "Cerrado" }
  ];

  const serviciosAdicionales = [
    "Estacionamiento gratuito",
    "Acceso para personas con discapacidad",
    "Sala de espera cómoda",
    "Wi-Fi gratuito",
    "Aire acondicionado"
  ];

  return (
    <section id="ubicacion" className="ubicacion">
      <div className="container">
        <div className="section-header">
          <h2>Ubicación y Horarios</h2>
          <p>Encuentra nuestra clínica en una ubicación céntrica y de fácil acceso</p>
        </div>

        <div className="ubicacion-content">
          <div className="ubicacion-info">
            <div className="info-card">
              <div className="info-icon">
                <MapPin size={24} />
              </div>
              <div className="info-content">
                <h3>Dirección</h3>
                <p>Calle 123 # 45-67, Local 2</p>
                <p>Barrio Centro, Bogotá D.C.</p>
                <p>Colombia</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <Clock size={24} />
              </div>
              <div className="info-content">
                <h3>Horarios de Atención</h3>
                {horarios.map((horario, index) => (
                  <div key={index} className="horario-item">
                    <span className="dia">{horario.dia}:</span>
                    <span className="hora">{horario.horario}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <Phone size={24} />
              </div>
              <div className="info-content">
                <h3>Contacto</h3>
                <p>Teléfono: (57) 1 234 5678</p>
                <p>Celular: (57) 300 123 4567</p>
                <p>WhatsApp: (57) 300 123 4567</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <Mail size={24} />
              </div>
              <div className="info-content">
                <h3>Email</h3>
                <p>info@clinicafisiosalud.com</p>
                <p>citas@clinicafisiosalud.com</p>
              </div>
            </div>
          </div>

          <div className="ubicacion-derecha">
            <div className="mapa-container">
              <div className="mapa-placeholder">
                <MapPin size={48} />
                <h3>Ubicación en Google Maps</h3>
                <p>Haz clic para ver la ubicación exacta</p>
                <button className="btn-secondary">
                  Ver en Google Maps
                </button>
              </div>
            </div>

            <div className="como-llegar">
              <h3>¿Cómo llegar?</h3>
              
              <div className="transporte-item">
                <div className="transporte-icon">
                  <Car size={20} />
                </div>
                <div className="transporte-info">
                  <h4>En Carro</h4>
                  <p>Estacionamiento gratuito disponible en el edificio</p>
                </div>
              </div>

              <div className="transporte-item">
                <div className="transporte-icon">
                  <Bus size={20} />
                </div>
                <div className="transporte-info">
                  <h4>En Transporte Público</h4>
                  <p>Rutas: 123, 456, 789 - Estación Centro (TransMilenio)</p>
                </div>
              </div>
            </div>

            <div className="servicios-adicionales">
              <h3>Servicios Adicionales</h3>
              <ul>
                {serviciosAdicionales.map((servicio, index) => (
                  <li key={index}>{servicio}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="emergencias">
          <div className="emergencia-card">
            <h3>Emergencias</h3>
            <p>Para emergencias fuera de horario, contáctanos al:</p>
            <p className="emergencia-telefono">(57) 300 123 4567</p>
            <p className="emergencia-nota">* Disponible 24/7 para casos urgentes</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ubicacion; 