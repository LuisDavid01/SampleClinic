import nodemailer from 'nodemailer';
import prisma from '../config/database.js';
import config from '../config/env.js';

class EmailService {
	constructor() {
		this.transporter = null;
		this.initializeTransporter();
	}

	/**
	 * Inicializar el transporter de nodemailer
	 */
	initializeTransporter() {
		try {
			this.transporter = nodemailer.createTransport({
				host: config.smtp.host,
				port: config.smtp.port,
				secure: config.smtp.secure,
				auth: {
					user: config.smtp.auth.user,
					pass: config.smtp.auth.pass
				}
			});

			// Verificar conexión en desarrollo
			if (config.nodeEnv === 'development') {
				this.transporter.verify((error, success) => {
					if (error) {
						console.warn('⚠️  Configuración SMTP no válida:', error.message);
						console.warn('   Los emails no se enviarán hasta configurar correctamente SMTP');
					} else {
						console.log('✅ Servicio de email configurado correctamente');
					}
				});
			}
		} catch (error) {
			console.error('Error inicializando transporter de email:', error);
		}
	}

	/**
	 * Enviar email de recordatorio de cita
	 * @param {Object} cita - Objeto de cita con información del paciente
	 * @param {String} tokenConfirmacion - Token único para confirmación
	 * @returns {Promise<Object>} Resultado del envío
	 */
	async enviarRecordatorioCita(cita, tokenConfirmacion) {
		try {
			if (!this.transporter || !config.smtp.auth.user || !config.smtp.auth.pass) {
				console.warn('⚠️  SMTP no configurado. Email no enviado para cita:', cita.idCita);
				return { success: false, error: 'SMTP no configurado' };
			}

			const paciente = cita.paciente;
			const medico = cita.medico;
			const servicio = cita.servicio;

			// Formatear fecha
			const fechaCita = new Date(cita.fechaCita);
			const fechaFormateada = fechaCita.toLocaleDateString('es-ES', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			const horaFormateada = fechaCita.toLocaleTimeString('es-ES', {
				hour: '2-digit',
				minute: '2-digit'
			});

			// URLs de confirmación y rechazo
			const urlConfirmar = `${config.frontendUrl}/citas/${cita.idCita}/confirmar?token=${tokenConfirmacion}`;
			const urlRechazar = `${config.frontendUrl}/citas/${cita.idCita}/rechazar?token=${tokenConfirmacion}`;

			// Plantilla HTML del email
			const htmlContent = this.generarPlantillaRecordatorio({
				nombrePaciente: `${paciente.nombre} ${paciente.apellido1}`,
				fechaFormateada,
				horaFormateada,
				nombreMedico: `${medico.nombre} ${medico.apellido1}`,
				nombreServicio: servicio?.nombreServicio || 'Consulta general',
				urlConfirmar,
				urlRechazar
			});

			const mailOptions = {
				from: `"${config.email.fromName}" <${config.email.from}>`,
				to: paciente.correoElectronico,
				subject: `Recordatorio: Tienes una cita el ${fechaFormateada}`,
				html: htmlContent,
				text: this.generarTextoRecordatorio({
					nombrePaciente: `${paciente.nombre} ${paciente.apellido1}`,
					fechaFormateada,
					horaFormateada,
					nombreMedico: `${medico.nombre} ${medico.apellido1}`,
					nombreServicio: servicio?.nombreServicio || 'Consulta general',
					urlConfirmar,
					urlRechazar
				})
			};

			const info = await this.transporter.sendMail(mailOptions);

			// Registrar en log
			await this.registrarEmailLog({
				idCita: cita.idCita,
				tipoEmail: 'recordatorio',
				destinatario: paciente.correoElectronico,
				asunto: mailOptions.subject,
				estado: 'enviado',
				tokenConfirmacion
			});

			console.log(`✅ Email de recordatorio enviado a ${paciente.correoElectronico} para cita #${cita.idCita}`);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			console.error('Error enviando email de recordatorio:', error);

			// Registrar error en log
			await this.registrarEmailLog({
				idCita: cita.idCita,
				tipoEmail: 'recordatorio',
				destinatario: cita.paciente?.correoElectronico || 'desconocido',
				asunto: `Recordatorio: Cita programada`,
				estado: 'fallido',
				errorMessage: error.message,
				tokenConfirmacion
			});

			return { success: false, error: error.message };
		}
	}

	/**
	 * Enviar email de confirmación de agendamiento de cita
	 * @param {Object} cita - Objeto de cita con información del paciente
	 * @returns {Promise<Object>} Resultado del envío
	 */
	async enviarEmailAgendamiento(cita) {
		try {
			if (!this.transporter || !config.smtp.auth.user || !config.smtp.auth.pass) {
				console.warn('⚠️  SMTP no configurado. Email no enviado para cita:', cita.idCita);
				return { success: false, error: 'SMTP no configurado' };
			}

			// Validar que el paciente tenga email
			if (!cita.paciente?.correoElectronico) {
				console.warn(`⚠️  Cita #${cita.idCita} no tiene email de paciente`);
				return { success: false, error: 'Email de paciente no disponible' };
			}

			const paciente = cita.paciente;
			const medico = cita.medico;
			const servicio = cita.servicio;

			// Formatear fecha
			const fechaCita = cita.fechaCita ? new Date(cita.fechaCita) : null;
			const fechaFormateada = fechaCita 
				? fechaCita.toLocaleDateString('es-ES', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})
				: 'Por confirmar';
			const horaFormateada = fechaCita 
				? fechaCita.toLocaleTimeString('es-ES', {
						hour: '2-digit',
						minute: '2-digit'
					})
				: 'Por confirmar';

			// Plantilla HTML del email
			const htmlContent = this.generarPlantillaAgendamiento({
				nombrePaciente: `${paciente.nombre} ${paciente.apellido1}`,
				fechaFormateada,
				horaFormateada,
				nombreMedico: `${medico.nombre} ${medico.apellido1}`,
				nombreServicio: servicio?.nombreServicio || 'Consulta general',
				descripcion: cita.descripcion || null
			});

			const mailOptions = {
				from: `"${config.email.fromName}" <${config.email.from}>`,
				to: paciente.correoElectronico,
				subject: `Cita agendada exitosamente - ${fechaFormateada}`,
				html: htmlContent,
				text: this.generarTextoAgendamiento({
					nombrePaciente: `${paciente.nombre} ${paciente.apellido1}`,
					fechaFormateada,
					horaFormateada,
					nombreMedico: `${medico.nombre} ${medico.apellido1}`,
					nombreServicio: servicio?.nombreServicio || 'Consulta general',
					descripcion: cita.descripcion || null
				})
			};

			const info = await this.transporter.sendMail(mailOptions);

			// Registrar en log
			await this.registrarEmailLog({
				idCita: cita.idCita,
				tipoEmail: 'agendamiento',
				destinatario: paciente.correoElectronico,
				asunto: mailOptions.subject,
				estado: 'enviado'
			});

			console.log(`✅ Email de agendamiento enviado a ${paciente.correoElectronico} para cita #${cita.idCita}`);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			console.error('Error enviando email de agendamiento:', error);

			// Registrar error en log
			await this.registrarEmailLog({
				idCita: cita.idCita,
				tipoEmail: 'agendamiento',
				destinatario: cita.paciente?.correoElectronico || 'desconocido',
				asunto: 'Cita agendada exitosamente',
				estado: 'fallido',
				errorMessage: error.message
			});

			return { success: false, error: error.message };
		}
	}

	/**
	 * Generar plantilla HTML para agendamiento
	 */
	generarPlantillaAgendamiento({ nombrePaciente, fechaFormateada, horaFormateada, nombreMedico, nombreServicio, descripcion }) {
		return `
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Confirmación de Cita - Clínica Esteban Porras</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
	<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
					<!-- Header -->
					<tr>
						<td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
							<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">✓ Cita Agendada</h1>
							<p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; font-weight: 300;">Clínica Esteban Porras</p>
						</td>
					</tr>
					
					<!-- Content -->
					<tr>
						<td style="padding: 40px 30px;">
							<p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
								Estimado/a <strong style="color: #059669;">${nombrePaciente}</strong>,
							</p>
							
							<p style="font-size: 15px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.7;">
								Nos complace confirmar que su cita ha sido agendada exitosamente en nuestra clínica. A continuación encontrará los detalles de su cita:
							</p>
							
							<!-- Appointment Details Card -->
							<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin: 30px 0;">
								<tr>
									<td style="padding: 25px;">
										<table role="presentation" style="width: 100%; border-collapse: collapse;">
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">📅</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Fecha</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #065f46; font-weight: 600;">${fechaFormateada}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">🕐</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Hora</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #065f46; font-weight: 600;">${horaFormateada}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">👨‍⚕️</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Fisioterapeuta</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #065f46; font-weight: 600;">${nombreMedico}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">🏥</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Servicio</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #065f46; font-weight: 600;">${nombreServicio}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
							
							${descripcion ? `
							<p style="font-size: 14px; color: #4b5563; margin: 20px 0; line-height: 1.6;">
								<strong>Notas:</strong> ${descripcion}
							</p>
							` : ''}
							
							<p style="font-size: 14px; color: #4b5563; margin: 30px 0 20px 0; line-height: 1.6;">
								<strong>Importante:</strong> Recibirá un recordatorio por correo electrónico 2 días antes de su cita para confirmar su asistencia.
							</p>
							
							<p style="font-size: 14px; color: #4b5563; margin: 20px 0; line-height: 1.6;">
								Si necesita modificar o cancelar su cita, por favor contáctenos con anticipación.
							</p>
						</td>
					</tr>
					
					<!-- Footer -->
					<tr>
						<td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
							<p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Clínica Esteban Porras</p>
							<p style="margin: 0; font-size: 12px; color: #94a3b8;">
								Este es un correo electrónico automático. Por favor, no responda a este mensaje.<br>
								Si tiene alguna consulta, comuníquese con nosotros a través de nuestros canales oficiales.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
		`.trim();
	}

	/**
	 * Generar versión texto plano del agendamiento
	 */
	generarTextoAgendamiento({ nombrePaciente, fechaFormateada, horaFormateada, nombreMedico, nombreServicio, descripcion }) {
		return `
Confirmación de Cita Agendada

Hola ${nombrePaciente},

Nos complace confirmar que su cita ha sido agendada exitosamente.

Detalles de la cita:
Fecha: ${fechaFormateada}
Hora: ${horaFormateada}
Fisioterapeuta: ${nombreMedico}
Servicio: ${nombreServicio}
${descripcion ? `Notas: ${descripcion}` : ''}

Importante: Recibirá un recordatorio por correo electrónico 2 días antes de su cita para confirmar su asistencia.

Si necesita modificar o cancelar su cita, por favor contáctenos con anticipación.

Este es un email automático, por favor no respondas a este mensaje.
		`.trim();
	}

	/**
	 * Generar plantilla HTML para recordatorio
	 */
	generarPlantillaRecordatorio({ nombrePaciente, fechaFormateada, horaFormateada, nombreMedico, nombreServicio, urlConfirmar, urlRechazar }) {
		return `
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Recordatorio de Cita - Clínica Esteban Porras</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
	<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
					<!-- Header -->
					<tr>
						<td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
							<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">Clínica Esteban Porras</h1>
							<p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 300;">Fisioterapia y Rehabilitación</p>
						</td>
					</tr>
					
					<!-- Content -->
					<tr>
						<td style="padding: 40px 30px;">
							<p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
								Estimado/a <strong style="color: #1e40af;">${nombrePaciente}</strong>,
							</p>
							
							<p style="font-size: 15px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.7;">
								Le recordamos que tiene una cita médica programada en nuestra clínica. Su confirmación de asistencia nos ayuda a brindarle un mejor servicio.
							</p>
							
							<!-- Appointment Details Card -->
							<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 30px 0;">
								<tr>
									<td style="padding: 25px;">
										<table role="presentation" style="width: 100%; border-collapse: collapse;">
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">📅</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Fecha</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${fechaFormateada}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">🕐</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Hora</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${horaFormateada}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">👨‍⚕️</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Fisioterapeuta</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${nombreMedico}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">🏥</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Servicio</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${nombreServicio}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
							
							<p style="font-size: 14px; color: #4b5563; margin: 30px 0 20px 0; line-height: 1.6; text-align: center;">
								Por favor, confirme o rechace su asistencia haciendo clic en uno de los botones siguientes:
							</p>
							
							<!-- Action Buttons -->
							<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
								<tr>
									<td align="center" style="padding: 10px;">
										<a href="${urlConfirmar}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); margin: 5px;">
											✓ Confirmar Asistencia
										</a>
									</td>
								</tr>
								<tr>
									<td align="center" style="padding: 10px;">
										<a href="${urlRechazar}" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); margin: 5px;">
											✗ Rechazar Cita
										</a>
									</td>
								</tr>
							</table>
							
							<!-- Footer Note -->
							<p style="font-size: 12px; color: #94a3b8; margin: 40px 0 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; line-height: 1.6;">
								<strong>Nota importante:</strong> Si los botones no funcionan, puede copiar y pegar los siguientes enlaces en su navegador:<br><br>
								<span style="color: #3b82f6;">Confirmar:</span> ${urlConfirmar}<br>
								<span style="color: #3b82f6;">Rechazar:</span> ${urlRechazar}
							</p>
						</td>
					</tr>
					
					<!-- Footer -->
					<tr>
						<td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
							<p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Clínica Esteban Porras</p>
							<p style="margin: 0; font-size: 12px; color: #94a3b8;">
								Este es un correo electrónico automático. Por favor, no responda a este mensaje.<br>
								Si tiene alguna consulta, comuníquese con nosotros a través de nuestros canales oficiales.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
		`.trim();
	}

	/**
	 * Generar versión texto plano del recordatorio
	 */
	generarTextoRecordatorio({ nombrePaciente, fechaFormateada, horaFormateada, nombreMedico, nombreServicio, urlConfirmar, urlRechazar }) {
		return `
Recordatorio de Cita

Hola ${nombrePaciente},

Te recordamos que tienes una cita programada:

Fecha: ${fechaFormateada}
Hora: ${horaFormateada}
Médico: ${nombreMedico}
Servicio: ${nombreServicio}

Por favor, confirma o rechaza tu asistencia visitando uno de los siguientes enlaces:

Confirmar asistencia: ${urlConfirmar}
Rechazar cita: ${urlRechazar}

Este es un email automático, por favor no respondas a este mensaje.
		`.trim();
	}

	/**
	 * Registrar log de email en base de datos
	 */
	async registrarEmailLog({ idCita, tipoEmail, destinatario, asunto, estado, errorMessage = null, tokenConfirmacion = null }) {
		try {
			await prisma.emailLog.create({
				data: {
					idCita,
					tipoEmail,
					destinatario,
					asunto,
					estado,
					errorMessage,
					tokenConfirmacion
				}
			});
		} catch (error) {
			console.error('Error registrando log de email:', error);
		}
	}

	/**
	 * Enviar email de notificación de solicitud de cita (borrador)
	 * @param {Object} cita - Objeto de cita con información del paciente
	 * @returns {Promise<Object>} Resultado del envío
	 */
	async enviarNotificacionSolicitudCita(cita) {
		try {
			if (!this.transporter || !config.smtp.auth.user || !config.smtp.auth.pass) {
				console.warn('⚠️  SMTP no configurado. Email no enviado para cita:', cita.idCita);
				return { success: false, error: 'SMTP no configurado' };
			}

			// Validar que el paciente tenga email
			if (!cita.paciente?.correoElectronico) {
				console.warn(`⚠️  Cita #${cita.idCita} no tiene email de paciente`);
				return { success: false, error: 'Email de paciente no disponible' };
			}

			const paciente = cita.paciente;
			const servicio = cita.servicio;

			// Formatear fecha
			const fechaCita = cita.fechaCita ? new Date(cita.fechaCita) : null;
			const fechaFormateada = fechaCita 
				? fechaCita.toLocaleDateString('es-ES', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})
				: 'Por confirmar';
			const horaFormateada = fechaCita 
				? fechaCita.toLocaleTimeString('es-ES', {
						hour: '2-digit',
						minute: '2-digit'
					})
				: 'Por confirmar';

			// Plantilla HTML del email
			const htmlContent = this.generarPlantillaSolicitudCita({
				nombrePaciente: `${paciente.nombre} ${paciente.apellido1}`,
				fechaFormateada,
				horaFormateada,
				nombreServicio: servicio?.nombreServicio || 'Consulta general',
				descripcion: cita.descripcion || null
			});

			const mailOptions = {
				from: `"${config.email.fromName}" <${config.email.from}>`,
				to: paciente.correoElectronico,
				subject: `Solicitud de cita recibida - ${fechaFormateada}`,
				html: htmlContent,
				text: this.generarTextoSolicitudCita({
					nombrePaciente: `${paciente.nombre} ${paciente.apellido1}`,
					fechaFormateada,
					horaFormateada,
					nombreServicio: servicio?.nombreServicio || 'Consulta general',
					descripcion: cita.descripcion || null
				})
			};

			const info = await this.transporter.sendMail(mailOptions);

			// Registrar en log
			await this.registrarEmailLog({
				idCita: cita.idCita,
				tipoEmail: 'solicitud',
				destinatario: paciente.correoElectronico,
				asunto: mailOptions.subject,
				estado: 'enviado'
			});

			console.log(`✅ Email de solicitud de cita enviado a ${paciente.correoElectronico} para cita #${cita.idCita}`);
			return { success: true, messageId: info.messageId };
		} catch (error) {
			console.error('Error enviando email de solicitud de cita:', error);

			// Registrar error en log
			await this.registrarEmailLog({
				idCita: cita.idCita,
				tipoEmail: 'solicitud',
				destinatario: cita.paciente?.correoElectronico || 'desconocido',
				asunto: 'Solicitud de cita recibida',
				estado: 'fallido',
				errorMessage: error.message
			});

			return { success: false, error: error.message };
		}
	}

	/**
	 * Generar plantilla HTML para solicitud de cita
	 */
	generarPlantillaSolicitudCita({ nombrePaciente, fechaFormateada, horaFormateada, nombreServicio, descripcion }) {
		return `
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Solicitud de Cita - Clínica Esteban Porras</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
	<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
					<!-- Header -->
					<tr>
						<td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
							<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">📋 Solicitud Recibida</h1>
							<p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 14px; font-weight: 300;">Clínica Esteban Porras</p>
						</td>
					</tr>
					
					<!-- Content -->
					<tr>
						<td style="padding: 40px 30px;">
							<p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
								Estimado/a <strong style="color: #d97706;">${nombrePaciente}</strong>,
							</p>
							
							<p style="font-size: 15px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.7;">
								Hemos recibido su solicitud de cita exitosamente. Nuestro equipo la revisará y se pondrá en contacto con usted para confirmar los detalles.
							</p>
							
							<!-- Request Details Card -->
							<table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; margin: 30px 0;">
								<tr>
									<td style="padding: 25px;">
										<table role="presentation" style="width: 100%; border-collapse: collapse;">
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">📅</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Fecha Solicitada</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #78350f; font-weight: 600;">${fechaFormateada}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">🕐</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Hora Solicitada</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #78350f; font-weight: 600;">${horaFormateada}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
											<tr>
												<td style="padding: 8px 0;">
													<table role="presentation" style="width: 100%; border-collapse: collapse;">
														<tr>
															<td style="width: 40px; vertical-align: top;">
																<div style="width: 32px; height: 32px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
																	<span style="color: #ffffff; font-size: 16px;">🏥</span>
																</div>
															</td>
															<td style="vertical-align: middle;">
																<p style="margin: 0; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Servicio</p>
																<p style="margin: 4px 0 0 0; font-size: 16px; color: #78350f; font-weight: 600;">${nombreServicio}</p>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
							
							${descripcion ? `
							<p style="font-size: 14px; color: #4b5563; margin: 20px 0; line-height: 1.6;">
								<strong>Razón de la cita:</strong> ${descripcion}
							</p>
							` : ''}
							
							<p style="font-size: 14px; color: #4b5563; margin: 30px 0 20px 0; line-height: 1.6;">
								<strong>Próximos pasos:</strong> Nuestro equipo revisará su solicitud y se pondrá en contacto con usted a la brevedad posible para confirmar la disponibilidad y finalizar el agendamiento de su cita.
							</p>
							
							<p style="font-size: 14px; color: #4b5563; margin: 20px 0; line-height: 1.6;">
								Una vez confirmada, recibirá un correo electrónico con todos los detalles de su cita, incluyendo la hora exacta y el fisioterapeuta asignado.
							</p>
						</td>
					</tr>
					
					<!-- Footer -->
					<tr>
						<td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
							<p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Clínica Esteban Porras</p>
							<p style="margin: 0; font-size: 12px; color: #94a3b8;">
								Este es un correo electrónico automático. Por favor, no responda a este mensaje.<br>
								Si tiene alguna consulta, comuníquese con nosotros a través de nuestros canales oficiales.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
		`.trim();
	}

	/**
	 * Generar versión texto plano de la solicitud de cita
	 */
	generarTextoSolicitudCita({ nombrePaciente, fechaFormateada, horaFormateada, nombreServicio, descripcion }) {
		return `
Solicitud de Cita Recibida

Hola ${nombrePaciente},

Hemos recibido su solicitud de cita exitosamente. Nuestro equipo la revisará y se pondrá en contacto con usted para confirmar los detalles.

Detalles de la solicitud:
Fecha solicitada: ${fechaFormateada}
Hora solicitada: ${horaFormateada}
Servicio: ${nombreServicio}
${descripcion ? `Razón de la cita: ${descripcion}` : ''}

Próximos pasos: Nuestro equipo revisará su solicitud y se pondrá en contacto con usted a la brevedad posible para confirmar la disponibilidad y finalizar el agendamiento de su cita.

Una vez confirmada, recibirá un correo electrónico con todos los detalles de su cita, incluyendo la hora exacta y el fisioterapeuta asignado.

Este es un email automático, por favor no respondas a este mensaje.
		`.trim();
	}

	/**
	 * Enviar email de confirmación de respuesta
	 */
	async enviarConfirmacionRespuesta(cita, confirmado) {
		try {
			if (!this.transporter || !config.smtp.auth.user || !config.smtp.auth.pass) {
				return { success: false, error: 'SMTP no configurado' };
			}

			const paciente = cita.paciente;
			const fechaCita = new Date(cita.fechaCita);
			const fechaFormateada = fechaCita.toLocaleDateString('es-ES', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});

			const asunto = confirmado 
				? `Confirmación recibida: Cita del ${fechaFormateada}`
				: `Cita rechazada: ${fechaFormateada}`;

			const mensaje = confirmado
				? `Hemos recibido tu confirmación. Te esperamos el ${fechaFormateada}.`
				: `Hemos recibido tu solicitud de cancelación para la cita del ${fechaFormateada}. Si necesitas reagendar, por favor contáctanos.`;

			const mailOptions = {
				from: `"${config.email.fromName}" <${config.email.from}>`,
				to: paciente.correoElectronico,
				subject: asunto,
				html: `
					<div style="font-family: Arial, sans-serif; padding: 20px;">
						<h2>${asunto}</h2>
						<p>Hola ${paciente.nombre} ${paciente.apellido1},</p>
						<p>${mensaje}</p>
						<p>Gracias por usar nuestros servicios.</p>
					</div>
				`,
				text: `${asunto}\n\nHola ${paciente.nombre} ${paciente.apellido1},\n\n${mensaje}\n\nGracias por usar nuestros servicios.`
			};

			await this.transporter.sendMail(mailOptions);
			await this.registrarEmailLog({
				idCita: cita.idCita,
				tipoEmail: confirmado ? 'confirmacion' : 'cancelacion',
				destinatario: paciente.correoElectronico,
				asunto,
				estado: 'enviado'
			});

			return { success: true };
		} catch (error) {
			console.error('Error enviando email de confirmación:', error);
			return { success: false, error: error.message };
		}
	}
}

// Exportar instancia única (singleton)
export default new EmailService();

