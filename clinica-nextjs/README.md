# Fisioterapia Esteban Porras - Clínica Next.js

Este proyecto es una aplicación web para la clínica de fisioterapia de Esteban Porras, desarrollada con Next.js.

## Descripción

Esta aplicación permite a los usuarios ver información sobre la clínica, agendar citas y administrar su información de perfil. Los administradores tienen un panel para gestionar usuarios y citas.

## Tecnologías Utilizadas

- **Framework:** [Next.js](https://nextjs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Autenticación:** [Clerk](https://clerk.com/)

## Cómo Empezar

Sigue estos pasos para levantar el entorno de desarrollo local.

### Prerrequisitos

- Node.js (v20 o superior)
- npm, yarn, pnpm, o bun

### Instalación

1. Navega al directorio del proyecto:
   ```bash
   cd clinica-nextjs
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Corriendo la Aplicación

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor de producción.
- `npm run lint`: Revisa el código con ESLint.
- `npm run format`: Formatea el código con Prettier.

## Estructura del Proyecto

```
.
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (landingPage)/
│   │   ├── admin/
│   │   │   └── ManageUsers/
│   │   ├── dashboard/
│   │   └── User/
│   ├── components/
│   ├── Interfaces/
│   └── utils/
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Tipos de Rutas en Next.js

Next.js utiliza un enrutador basado en el sistema de archivos. El framework soporta diferentes tipos de rutas para crear una aplicación web, cada una con una convención de nomenclatura y un propósito específicos:

- **`page.tsx`**: Define una interfaz de usuario públicamente accesible para una ruta. En este proyecto, ejemplos incluyen las páginas de inicio de sesión, registro y el panel de control.
- **`layout.tsx`**: Una interfaz de usuario compartida para un segmento y sus hijos. Un layout envuelve una página o un layout hijo. En este proyecto, hay layouts principales para la autenticación, la página de destino y la aplicación principal.
- **Grupos de Rutas `(nombreDeCarpeta)`**: Organiza las rutas sin afectar la ruta de la URL. Se utilizan para separar diferentes secciones de la aplicación, como la autenticación `(auth)`, la página de destino `(landingPage)` y la aplicación principal.


## Dependencias Principales

- `@clerk/nextjs`: Para la autenticación de usuarios.
- `next`: El framework de React para producción.
- `react`: Biblioteca para construir interfaces de usuario.
- `tailwindcss`: Framework de CSS para un diseño rápido.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir los cambios.