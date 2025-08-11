"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export const CitasForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha: "",
    hora: "",
    servicio: "",
    mensaje: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aquí iría la lógica real para enviar los datos
    console.log("Datos del formulario:", formData);
    
    setIsSubmitting(false);
    // Resetear formulario
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      fecha: "",
      hora: "",
      servicio: "",
      mensaje: "",
    });
    
    alert("¡Cita agendada exitosamente! Te contactaremos pronto para confirmar.");
  };

  const servicios = [
    "Terapia Manual",
    "Rehabilitación",
    "Prevención",
    "Evaluación Biomecánica",
    "Terapia Deportiva",
    "Otro"
  ];

  const horas = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const inputStyles = "w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 placeholder:text-text-primary/50";
  const selectStyles = "w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 cursor-pointer";
  const textareaStyles = "w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 placeholder:text-text-primary/50 min-h-[120px] resize-none";

  return (
    <section id="citas" className="py-24 bg-gradient-to-br from-background to-card/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-text-primary rounded-full text-sm font-medium mb-4">
            Agenda tu Cita
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6">
            Reserva tu
            <span className="text-transparent bg-accent bg-clip-text">
              {" "}
              Consulta
            </span>
          </h2>
          <p className="text-lg text-text-primary max-w-3xl mx-auto leading-relaxed">
            Agenda tu cita de manera fácil y rápida. Nuestro equipo se pondrá en contacto contigo para confirmar tu consulta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Información de contacto */}
          <div className="space-y-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-card-foreground/10">
              <h3 className="text-2xl font-bold text-text-primary mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">Teléfono</h4>
                    <p className="text-text-primary/70">+506 8888-8888</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">Email</h4>
                    <p className="text-text-primary/70">info@clinicaestebanporras.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">WhatsApp</h4>
                    <p className="text-text-primary/70">+506 8888-8888</p>
                    <a 
                      href="https://wa.me/+50688888888?text=Hola,%20me%20gustaría%20agendar%20una%20cita%20en%20la%20Clínica%20Esteban%20Porras"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Contactar por WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">Horarios</h4>
                    <p className="text-text-primary/70">Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                    <p className="text-text-primary/70">Sábados: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 shadow-xl">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                ¿Por qué elegirnos?
              </h3>
              <ul className="space-y-3 text-text-primary/80">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Atención personalizada y profesional
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Equipo altamente capacitado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Tecnología de vanguardia
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Resultados comprobados
                </li>
              </ul>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-card-foreground/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="nombre" className="text-text-primary font-semibold text-sm">
                    Nombre Completo *
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={inputStyles}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-text-primary font-semibold text-sm">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputStyles}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="telefono" className="text-text-primary font-semibold text-sm">
                  Teléfono *
                </Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="+506 8888-8888"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="fecha" className="text-text-primary font-semibold text-sm">
                    Fecha Preferida *
                  </Label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30"
                    required
                    title="Selecciona una fecha para tu cita"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="hora" className="text-text-primary font-semibold text-sm">
                    Hora Preferida *
                  </Label>
                  <select
                    id="hora"
                    name="hora"
                    required
                    value={formData.hora}
                    onChange={handleInputChange}
                    className={inputStyles}
                    aria-label="Selecciona una hora para tu cita"
                  >
                    <option value="">Selecciona una hora</option>
                    {horas.map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="servicio" className="text-text-primary font-semibold text-sm">
                  Servicio de Interés *
                </Label>
                <select
                  id="servicio"
                  name="servicio"
                  required
                  value={formData.servicio}
                  onChange={handleInputChange}
                  className={inputStyles}
                  aria-label="Selecciona un servicio de interés"
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="mensaje" className="text-text-primary font-semibold text-sm">
                  Mensaje Adicional
                </Label>
                <Textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  className={textareaStyles}
                  placeholder="Describe brevemente tu condición o motivo de consulta..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-black hover:from-primary/90 hover:to-primary/70 font-semibold py-4 text-lg rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Agendando...
                  </div>
                ) : (
                  "Agendar Cita"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}; 