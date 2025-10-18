import express from 'express';
import { body, param, query } from 'express-validator';
import { clerkAuth } from '../middleware/clerkAuth.js';
import upload, { handleUploadError } from '../middleware/upload.js';
import { 
  listarArchivos, 
  obtenerArchivo, 
  descargarArchivo, 
  eliminarArchivo, 
  actualizarArchivo, 
  subirArchivos,
  obtenerCategorias,
  servirArchivo
} from '../controllers/archivos.js';

const router = express.Router();

// Validaciones
const validarIdUsuario = [
  param('idUsuario').isInt({ min: 1 }).withMessage('ID de usuario inválido')
];

const validarIdArchivo = [
  param('id').isInt({ min: 1 }).withMessage('ID de archivo inválido'),
  param('idUsuario').isInt({ min: 1 }).withMessage('ID de usuario inválido')
];

const validarActualizacionArchivo = [
  body('descripcion').optional().isString().isLength({ max: 500 }).withMessage('Descripción debe ser una cadena de máximo 500 caracteres'),
  body('categoria').optional().isString().isLength({ max: 100 }).withMessage('Categoría debe ser una cadena de máximo 100 caracteres'),
  body('etiquetas').optional().isString().isLength({ max: 500 }).withMessage('Etiquetas deben ser una cadena de máximo 500 caracteres'),
  body('esPublico').optional().isBoolean().withMessage('esPublico debe ser un valor booleano')
];

const validarSubidaArchivos = [
  body('expedienteId').optional().isInt({ min: 1 }).withMessage('ID de expediente inválido'),
  body('categoria').optional().isString().isLength({ max: 100 }).withMessage('Categoría debe ser una cadena de máximo 100 caracteres')
];

const validarListadoArchivos = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero mayor a 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe ser un número entre 1 y 100'),
  query('categoria').optional().isString().isLength({ max: 100 }).withMessage('Categoría debe ser una cadena de máximo 100 caracteres'),
  query('search').optional().isString().isLength({ max: 255 }).withMessage('Búsqueda debe ser una cadena de máximo 255 caracteres'),
  query('expedienteId').optional().isInt({ min: 1 }).withMessage('ID de expediente inválido')
];

// Rutas de archivos

/**
 * @swagger
 * /api/files/{idUsuario}:
 *   get:
 *     summary: Listar archivos del usuario
 *     description: |
 *       Obtiene la lista de archivos del usuario especificado con paginación y filtros.
 *       
 *       **Características:**
 *       - Paginación automática
 *       - Filtros por categoría, búsqueda y expediente
 *       - Ordenamiento por fecha de subida (más recientes primero)
 *       - Información completa de cada archivo
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario de los archivos
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página (máximo 100)
 *         example: 10
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filtrar archivos por categoría específica
 *         example: "Documentos"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Buscar en nombre original, descripción o etiquetas (búsqueda insensible a mayúsculas)
 *         example: "radiografia"
 *       - in: query
 *         name: expedienteId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filtrar archivos asociados a un expediente específico
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista de archivos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Archivo'
 *                       - type: object
 *                         properties:
 *                           expediente:
 *                             type: object
 *                             properties:
 *                               idExpediente:
 *                                 type: integer
 *                                 example: 5
 *                               cedula:
 *                                 type: string
 *                                 example: "12345678"
 *                               estado:
 *                                 type: string
 *                                 example: "activo"
 *                 pagination:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Pagination'
 *                     - type: object
 *                       properties:
 *                         hasNext:
 *                           type: boolean
 *                           description: Indica si hay más páginas disponibles
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           description: Indica si hay páginas anteriores disponibles
 *                           example: false
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:idUsuario', validarIdUsuario, validarListadoArchivos, listarArchivos);

/**
 * @swagger
 * /api/files/{idUsuario}/categories:
 *   get:
 *     summary: Obtener categorías disponibles
 *     description: |
 *       Obtiene la lista de categorías únicas de archivos del usuario especificado.
 *       
 *       **Características:**
 *       - Solo categorías no nulas
 *       - Lista única sin duplicados
 *       - Ordenadas alfabéticamente
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario de los archivos
 *         example: 1
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Lista de categorías únicas
 *                   example: ["Documentos", "Imágenes", "Radiografías", "Videos"]
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:idUsuario/categories', validarIdUsuario, obtenerCategorias);

/**
 * @swagger
 * /api/files/{idUsuario}/upload:
 *   post:
 *     summary: Subir archivos
 *     description: |
 *       Sube uno o más archivos al sistema para el usuario especificado.
 *       
 *       **Límites y restricciones:**
 *       - Máximo 5 archivos por solicitud
 *       - Máximo 10MB por archivo
 *       - Tipos de archivo permitidos: imágenes, documentos, videos, audio, archivos de texto
 *       - Nombres de archivo únicos (se generan automáticamente si hay conflictos)
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario de los archivos
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Archivos a subir (máximo 5 archivos)
 *                 example: ["archivo1.jpg", "archivo2.pdf"]
 *               expedienteId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID del expediente médico asociado (opcional)
 *                 example: 5
 *               categoria:
 *                 type: string
 *                 maxLength: 100
 *                 description: Categoría del archivo para organización (opcional)
 *                 example: "Radiografías"
 *           encoding:
 *             files:
 *               contentType: "application/octet-stream"
 *     responses:
 *       200:
 *         description: Archivos subidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Archivo'
 *                   description: Lista de archivos subidos con información completa
 *                 message:
 *                   type: string
 *                   example: "3 archivo(s) subido(s) exitosamente"
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se proporcionaron archivos"
 *                 message:
 *                   type: string
 *                   example: "Debe seleccionar al menos un archivo para subir"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       413:
 *         description: Archivo demasiado grande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Archivo demasiado grande"
 *                 message:
 *                   type: string
 *                   example: "El archivo excede el límite de 10MB"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:idUsuario/upload', validarIdUsuario, upload.array('files', 5), handleUploadError, validarSubidaArchivos, subirArchivos);

/**
 * @swagger
 * /api/files/{idUsuario}/{id}:
 *   get:
 *     summary: Obtener información de un archivo
 *     description: |
 *       Obtiene la información completa de un archivo específico del usuario.
 *       
 *       **Información incluida:**
 *       - Metadatos del archivo (nombre, tamaño, tipo, fechas)
 *       - Información del expediente asociado (si aplica)
 *       - Estado del archivo (activo/inactivo)
 *       - Permisos de acceso
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario del archivo
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del archivo
 *         example: 5
 *     responses:
 *       200:
 *         description: Información del archivo obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Archivo'
 *                     - type: object
 *                       properties:
 *                         expediente:
 *                           type: object
 *                           properties:
 *                             idExpediente:
 *                               type: integer
 *                               example: 5
 *                             cedula:
 *                               type: string
 *                               example: "12345678"
 *                             estado:
 *                               type: string
 *                               example: "activo"
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Archivo no encontrado"
 *                 message:
 *                   type: string
 *                   example: "El archivo solicitado no existe o no tienes permisos para accederlo"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:idUsuario/:id', clerkAuth, validarIdArchivo, obtenerArchivo);

/**
 * @swagger
 * /api/files/{idUsuario}/{id}/download:
 *   get:
 *     summary: Descargar un archivo
 *     description: |
 *       Descarga un archivo específico del usuario como archivo adjunto.
 *       
 *       **Características:**
 *       - Fuerza la descarga del archivo (no visualización inline)
 *       - Headers de descarga apropiados
 *       - Nombre de archivo original preservado
 *       - Verificación de permisos de acceso
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario del archivo
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del archivo
 *         example: 5
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Indica que el archivo debe descargarse
 *             schema:
 *               type: string
 *               example: "attachment; filename=\"documento.pdf\""
 *           Content-Type:
 *             description: Tipo MIME del archivo
 *             schema:
 *               type: string
 *               example: "application/pdf"
 *           Content-Length:
 *             description: Tamaño del archivo en bytes
 *             schema:
 *               type: integer
 *               example: 1024000
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Archivo no encontrado"
 *                 message:
 *                   type: string
 *                   example: "El archivo solicitado no existe o no tienes permisos para accederlo"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:idUsuario/:id/download', clerkAuth, validarIdArchivo, descargarArchivo);

/**
 * @swagger
 * /api/files/{idUsuario}/{id}/serve:
 *   get:
 *     summary: Servir archivo para visualización
 *     description: |
 *       Sirve un archivo para visualización directa en el navegador (inline).
 *       
 *       **Características principales:**
 *       - **Visualización inline**: Archivos se muestran directamente en el navegador
 *       - **Streaming**: Soporte para archivos grandes con Range requests
 *       - **Cache inteligente**: Headers de cache para optimización
 *       - **Tipos de archivo**: Imágenes, PDFs, videos, documentos
 *       - **Seguridad**: Verificación de permisos de acceso
 *       
 *       **Casos de uso:**
 *       - Mostrar imágenes en galerías
 *       - Visualizar PDFs en iframes
 *       - Reproducir videos en reproductores HTML5
 *       - Mostrar documentos de texto
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario del archivo
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del archivo
 *         example: 5
 *       - in: header
 *         name: Range
 *         required: false
 *         schema:
 *           type: string
 *         description: Rango de bytes para streaming (ej: "bytes=0-1023")
 *         example: "bytes=0-1023"
 *     responses:
 *       200:
 *         description: Archivo servido exitosamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             description: Tipo MIME del archivo
 *             schema:
 *               type: string
 *             examples:
 *               image:
 *                 summary: Imagen
 *                 value: "image/jpeg"
 *               pdf:
 *                 summary: PDF
 *                 value: "application/pdf"
 *               video:
 *                 summary: Video
 *                 value: "video/mp4"
 *               text:
 *                 summary: Texto
 *                 value: "text/plain"
 *           Content-Disposition:
 *             description: Indica visualización inline
 *             schema:
 *               type: string
 *               example: "inline; filename=\"documento.pdf\""
 *           Content-Length:
 *             description: Tamaño del archivo en bytes
 *             schema:
 *               type: integer
 *               example: 1024000
 *           Cache-Control:
 *             description: Directivas de cache
 *             schema:
 *               type: string
 *               example: "public, max-age=3600"
 *       206:
 *         description: Archivo servido parcialmente (streaming)
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Range:
 *             description: Rango de bytes servidos
 *             schema:
 *               type: string
 *               example: "bytes 0-1023/1024000"
 *           Accept-Ranges:
 *             description: Indica soporte para Range requests
 *             schema:
 *               type: string
 *               example: "bytes"
 *           Content-Length:
 *             description: Tamaño del fragmento en bytes
 *             schema:
 *               type: integer
 *               example: 1024
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Archivo no encontrado"
 *                 message:
 *                   type: string
 *                   example: "El archivo solicitado no existe o no tienes permisos para accederlo"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:idUsuario/:id/serve', validarIdArchivo, servirArchivo);

/**
 * @swagger
 * /api/files/{idUsuario}/{id}:
 *   patch:
 *     summary: Actualizar metadata de un archivo
 *     description: |
 *       Actualiza los metadatos de un archivo específico del usuario.
 *       
 *       **Campos actualizables:**
 *       - Descripción del archivo
 *       - Categoría para organización
 *       - Etiquetas para búsqueda
 *       - Visibilidad pública/privada
 *       
 *       **Características:**
 *       - Solo el propietario puede actualizar
 *       - Campos opcionales (se actualizan solo los enviados)
 *       - Validación de longitud de campos
 *       - Actualización de fecha de modificación automática
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario del archivo
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del archivo
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción detallada del archivo
 *                 example: "Radiografía de rodilla izquierda - Vista lateral"
 *               categoria:
 *                 type: string
 *                 maxLength: 100
 *                 description: Categoría para organización del archivo
 *                 example: "Radiografías"
 *               etiquetas:
 *                 type: string
 *                 maxLength: 500
 *                 description: Etiquetas separadas por comas para búsqueda
 *                 example: "rodilla, lateral, lesión, 2024"
 *               esPublico:
 *                 type: boolean
 *                 description: Si el archivo es visible públicamente
 *                 example: false
 *           example:
 *             descripcion: "Radiografía de rodilla izquierda - Vista lateral"
 *             categoria: "Radiografías"
 *             etiquetas: "rodilla, lateral, lesión, 2024"
 *             esPublico: false
 *     responses:
 *       200:
 *         description: Archivo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Archivo'
 *                 message:
 *                   type: string
 *                   example: "Archivo actualizado exitosamente"
 *       400:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error de validación"
 *                 message:
 *                   type: string
 *                   example: "Descripción debe ser una cadena de máximo 500 caracteres"
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Archivo no encontrado"
 *                 message:
 *                   type: string
 *                   example: "El archivo solicitado no existe o no tienes permisos para modificarlo"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:idUsuario/:id', clerkAuth, validarIdArchivo, validarActualizacionArchivo, actualizarArchivo);

/**
 * @swagger
 * /api/files/{idUsuario}/{id}:
 *   delete:
 *     summary: Eliminar un archivo
 *     description: |
 *       Elimina un archivo específico del usuario (soft delete).
 *       
 *       **Características:**
 *       - **Soft delete**: El archivo se marca como inactivo, no se elimina físicamente
 *       - **Eliminación física**: El archivo se elimina del sistema de archivos
 *       - **Seguridad**: Solo el propietario puede eliminar
 *       - **Irreversible**: La eliminación no se puede deshacer
 *       
 *       **Proceso de eliminación:**
 *       1. Verificación de permisos de acceso
 *       2. Eliminación del archivo físico del servidor
 *       3. Marcado como inactivo en la base de datos
 *       4. Confirmación de eliminación
 *       
 *       **Autenticación:** Requiere token de Clerk válido
 *     tags: [Archivos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del usuario propietario del archivo
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del archivo a eliminar
 *         example: 5
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Archivo eliminado exitosamente"
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Archivo no encontrado"
 *                 message:
 *                   type: string
 *                   example: "El archivo solicitado no existe o no tienes permisos para eliminarlo"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:idUsuario/:id', clerkAuth, validarIdArchivo, eliminarArchivo);

export default router;
