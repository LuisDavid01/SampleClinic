# Clínica de Fisioterapia - Esteban Porras

Este es el repositorio del código para la página web de la Clínica de Fisioterapia de Esteban Porras. El proyecto está construido con tecnologías web modernas para proporcionar una experiencia de usuario rápida, receptiva y atractiva.

## Empezando

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para desarrollo y pruebas.

### Pre-requisitos

Necesitarás tener Node.js y npm (o un gestor de paquetes equivalente) instalados en tu sistema.

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [npm](https://www.npmjs.com/)

### Instalación

1.  Clona el repositorio en tu máquina local:

    ```bash
    git clone https://github.com/tu-usuario/Fisioterapia-esteban-porras.git
    ```

2.  Navega al directorio del proyecto:

    ```bash
    cd clinica-web
    ```

3.  Instala las dependencias del proyecto:

    ```bash
    npm install
    ```

## Corriendo el Proyecto

Para iniciar el servidor de desarrollo y ver la aplicación en tu navegador, ejecuta el siguiente comando:

```bash
npm run dev
```

Esto iniciará la aplicación en modo de desarrollo. Abre [http://localhost:5173](http://localhost:5173) (o el puerto que se indique en la terminal) para verla en el navegador. La página se recargará si realizas cambios en el código.

## Tecnologías Utilizadas

Este proyecto utiliza una variedad de tecnologías modernas de desarrollo web:

### Framework y Librerías

-   **React 19:** Una biblioteca de JavaScript para construir interfaces de usuario.
-   **Vite:** Un entorno de desarrollo de frontend rápido que proporciona una experiencia de desarrollo más ágil.
-   **TanStack Router:** Enrutamiento para aplicaciones React, con un enfoque en la seguridad de tipos y la eficiencia.
-   **TanStack Query:** Para la obtención, almacenamiento en caché y actualización de datos en aplicaciones React.
-   **Tailwind CSS:** Un framework de CSS de utilidad primero para un diseño rápido y personalizado.
-   **TypeScript:** Un superconjunto de JavaScript que añade tipado estático opcional.

### Componentes de UI

-   **Shadcn:** Primitivas de UI sin estilo para construir componentes de diseño de alta calidad.
-   **Lucide React:** Un conjunto de iconos SVG simple y hermoso.
-   **Embla Carousel React:** Un carrusel extensible y ligero con una API fluida.

### Herramientas de Desarrollo

-   **ESLint:** Para el análisis estático de código para encontrar problemas.
-   **Prettier:** Un formateador de código opinado.
-   **PostCSS:** Una herramienta para transformar CSS con plugins de JavaScript.

## Scripts Disponibles

En el `package.json`, puedes encontrar los siguientes scripts:

-   `npm run dev`: Inicia la aplicación en modo de desarrollo.
-   `npm run build`: Compila la aplicación para producción en la carpeta `dist`.
-   `npm run lint`: Ejecuta ESLint para analizar el código en busca de errores de estilo y de código.
-   `npm run preview`: Sirve la compilación de producción localmente para previsualizarla.

## Estructura del Proyecto

El código fuente principal se encuentra en la carpeta `src`.

```
.
├── src/
│   ├── assets/         # Imágenes y otros recursos estáticos
│   ├── components/     # Componentes de React reutilizables
│   ├── lib/            # Funciones de utilidad
│   ├── routes/         # Configuración de rutas de la aplicación
│   ├── App.tsx         # Componente principal de la aplicación
│   ├── main.tsx        # Punto de entrada de la aplicación
│   └── index.css       # Estilos globales
├── public/             # Archivos estáticos que no se procesan por Vite
├── package.json        # Dependencias y scripts del proyecto
├── vite.config.ts      # Configuración de Vite
└── tailwind.config.mjs # Configuración de Tailwind CSS
```