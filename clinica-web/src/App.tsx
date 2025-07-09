import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Servicios from './components/Servicios';
import PerfilProfesional from './components/PerfilProfesional';
import Ubicacion from './components/Ubicacion';
import AgendarCita from './components/AgendarCita';
import Contacto from './components/Contacto';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Servicios />
              <PerfilProfesional />
              <Ubicacion />
              <AgendarCita />
              <Contacto />
            </>
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
