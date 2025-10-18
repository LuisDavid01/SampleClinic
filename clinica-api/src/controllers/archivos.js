import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

/**
 * Listar archivos del usuario con paginación
 * GET /api/files/:idUsuario
 */
export const listarArchivos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      categoria, 
      search,
      expedienteId 
    } = req.query;
    
    const userId = parseInt(req.params.idUsuario);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros
    const where = {
      idUsuario: userId,
      activo: true
    };
    
    if (categoria) {
      where.categoria = categoria;
    }
    
    if (expedienteId) {
      where.idExpediente = parseInt(expedienteId);
    }
    
    if (search) {
      where.OR = [
        { nombreOriginal: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { etiquetas: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Obtener archivos con paginación
    const [archivos, total] = await Promise.all([
      prisma.archivo.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { fechaSubida: 'desc' },
        include: {
          expediente: {
            select: {
              idExpediente: true,
              cedula: true,
              estado: true
            }
          }
        }
      }),
      prisma.archivo.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: archivos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('Error listando archivos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los archivos'
    });
  }
};

/**
 * Obtener información de un archivo específico
 * GET /api/files/:idUsuario/:id
 */
export const obtenerArchivo = async (req, res) => {
  try {
    const { id, idUsuario } = req.params;
    const userId = parseInt(idUsuario);
    
    const archivo = await prisma.archivo.findFirst({
      where: {
        idArchivo: parseInt(id),
        idUsuario: userId,
        activo: true
      },
      include: {
        expediente: {
          select: {
            idExpediente: true,
            cedula: true,
            estado: true
          }
        }
      }
    });
    
    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe o no tienes permisos para accederlo'
      });
    }
    
    res.json({
      success: true,
      data: archivo
    });
    
  } catch (error) {
    console.error('Error obteniendo archivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la información del archivo'
    });
  }
};

/**
 * Descargar un archivo
 * GET /api/files/:idUsuario/:id/download
 */
export const descargarArchivo = async (req, res) => {
  try {
    const { id, idUsuario } = req.params;
    const userId = parseInt(idUsuario);
    
    const archivo = await prisma.archivo.findFirst({
      where: {
        idArchivo: parseInt(id),
        idUsuario: userId,
        activo: true
      }
    });
    
    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe o no tienes permisos para accederlo'
      });
    }
    
    const filePath = path.join(__dirname, '../../uploads', archivo.rutaArchivo);
    
    // Verificar que el archivo existe físicamente
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo físico no existe en el servidor'
      });
    }
    
    // Configurar headers para descarga
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombreOriginal}"`);
    res.setHeader('Content-Type', archivo.tipoMime);
    res.setHeader('Content-Length', archivo.tamanoArchivo);
    
    // Enviar archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Manejar errores del stream
    fileStream.on('error', (error) => {
      console.error('Error enviando archivo:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Error enviando archivo',
          message: 'No se pudo enviar el archivo'
        });
      }
    });
    
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo descargar el archivo'
    });
  }
};

/**
 * Eliminar un archivo
 * DELETE /api/files/:idUsuario/:id
 */
export const eliminarArchivo = async (req, res) => {
  try {
    const { id, idUsuario } = req.params;
    const userId = parseInt(idUsuario);
    
    const archivo = await prisma.archivo.findFirst({
      where: {
        idArchivo: parseInt(id),
        idUsuario: userId,
        activo: true
      }
    });
    
    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe o no tienes permisos para eliminarlo'
      });
    }
    
    // Eliminar archivo físico
    const filePath = path.join(__dirname, '../../uploads', archivo.rutaArchivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Marcar como inactivo en la base de datos (soft delete)
    await prisma.archivo.update({
      where: { idArchivo: parseInt(id) },
      data: { activo: false }
    });
    
    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el archivo'
    });
  }
};

/**
 * Actualizar metadata de un archivo
 * PATCH /api/files/:idUsuario/:id
 */
export const actualizarArchivo = async (req, res) => {
  try {
    const { id, idUsuario } = req.params;
    const userId = parseInt(idUsuario);
    const { descripcion, categoria, etiquetas, esPublico } = req.body;
    
    const archivo = await prisma.archivo.findFirst({
      where: {
        idArchivo: parseInt(id),
        idUsuario: userId,
        activo: true
      }
    });
    
    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe o no tienes permisos para modificarlo'
      });
    }
    
    // Preparar datos para actualizar
    const updateData = {};
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (etiquetas !== undefined) updateData.etiquetas = etiquetas;
    if (esPublico !== undefined) updateData.esPublico = esPublico;
    
    const archivoActualizado = await prisma.archivo.update({
      where: { idArchivo: parseInt(id) },
      data: updateData,
      include: {
        expediente: {
          select: {
            idExpediente: true,
            cedula: true,
            estado: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: archivoActualizado,
      message: 'Archivo actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando archivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el archivo'
    });
  }
};

/**
 * Subir archivos
 * POST /api/files/:idUsuario/upload
 */
export const subirArchivos = async (req, res) => {
  try {
    const userId = parseInt(req.params.idUsuario);
    const { expedienteId, categoria } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No se proporcionaron archivos',
        message: 'Debe seleccionar al menos un archivo para subir'
      });
    }
    
    const archivosSubidos = [];
    
    for (const file of req.files) {
      try {
        // Generar ruta relativa para la base de datos
        const relativePath = path.relative(
          path.join(__dirname, '../../uploads'),
          file.path
        );
        
        // Crear registro en la base de datos
        const archivo = await prisma.archivo.create({
          data: {
            nombreOriginal: file.originalname,
            nombreArchivo: file.filename,
            rutaArchivo: relativePath,
            tipoMime: file.mimetype,
            tamanoArchivo: file.size,
            extension: path.extname(file.originalname),
            idUsuario: userId,
            idExpediente: expedienteId ? parseInt(expedienteId) : null,
            categoria: categoria || null
          }
        });
        
        archivosSubidos.push(archivo);
        
      } catch (error) {
        console.error('Error creando registro de archivo:', error);
        // Si falla la creación en BD, eliminar archivo físico
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    if (archivosSubidos.length === 0) {
      return res.status(500).json({
        error: 'Error subiendo archivos',
        message: 'No se pudieron subir los archivos'
      });
    }
    
    res.json({
      success: true,
      data: archivosSubidos,
      message: `${archivosSubidos.length} archivo(s) subido(s) exitosamente`
    });
    
  } catch (error) {
    console.error('Error subiendo archivos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron subir los archivos'
    });
  }
};

/**
 * Servir archivo de forma segura (para visualización)
 * GET /api/files/:idUsuario/:id/serve
 */
export const servirArchivo = async (req, res) => {
  try {
    const { id, idUsuario } = req.params;
    const userId = parseInt(idUsuario);
    
    const archivo = await prisma.archivo.findFirst({
      where: {
        idArchivo: parseInt(id),
        idUsuario: userId,
        activo: true
      }
    });
    
    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe o no tienes permisos para accederlo'
      });
    }
    
    const filePath = path.join(__dirname, '../../uploads', archivo.rutaArchivo);
    
    // Verificar que el archivo existe físicamente
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo físico no existe en el servidor'
      });
    }
    
    // Configurar headers para visualización
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Si hay un rango, manejar streaming (para videos/imágenes grandes)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': archivo.tipoMime,
        'Content-Disposition': `inline; filename="${archivo.nombreOriginal}"`
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Servir archivo completo
      const head = {
        'Content-Length': fileSize,
        'Content-Type': archivo.tipoMime,
        'Content-Disposition': `inline; filename="${archivo.nombreOriginal}"`,
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
    
  } catch (error) {
    console.error('Error sirviendo archivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo servir el archivo'
    });
  }
};

/**
 * Obtener categorías disponibles
 * GET /api/files/:idUsuario/categories
 */
export const obtenerCategorias = async (req, res) => {
  try {
    const userId = parseInt(req.params.idUsuario);
    
    const categorias = await prisma.archivo.findMany({
      where: {
        idUsuario: userId,
        activo: true,
        categoria: { not: null }
      },
      select: { categoria: true },
      distinct: ['categoria']
    });
    
    res.json({
      success: true,
      data: categorias.map(c => c.categoria).filter(Boolean)
    });
    
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las categorías'
    });
  }
};
