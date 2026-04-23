import React, { useMemo } from 'react';
import GoalCard from './components/GoalCard';
import golesData from './goles.json';
import './App.css'; 

// --- FUNCIONES AUXILIARES ---
const parseFecha = (fechaStr) => {
  const [dia, mes, anio] = fechaStr.split('/');
  return new Date(anio, mes - 1, dia); 
};

const parseMinuto = (minutoStr) => {
  const str = String(minutoStr);
  if (str.includes('+')) {
    const [base, extra] = str.split('+');
    return parseInt(base) + (parseInt(extra) / 100);
  }
  return parseInt(str);
};

// --- COMPONENTE PRINCIPAL ---
function App() {
  
  // LÓGICA INTACTA: Ordenamos y luego agrupamos los goles por partido
  const partidosAgrupados = useMemo(() => {
    const golesOrdenados = [...golesData].sort((a, b) => {
      const fechaA = parseFecha(a.fecha);
      const fechaB = parseFecha(b.fecha);
      if (fechaA.getTime() !== fechaB.getTime()) return fechaB - fechaA; 
      return parseMinuto(b.minuto) - parseMinuto(a.minuto);
    });

    const grupos = [];
    let partidoActualKey = "";

    golesOrdenados.forEach((gol) => {
      const llavePartido = `${gol.fecha}-${gol.partido}`;

      if (llavePartido !== partidoActualKey) {
        grupos.push({
          id: llavePartido,
          fecha: gol.fecha,
          nombrePartido: gol.partido,
          goles: [gol]
        });
        partidoActualKey = llavePartido;
      } else {
        grupos[grupos.length - 1].goles.push(gol);
      }
    });

    return grupos;
  }, []); 

  return (
    <div className="App"> {/* 1. Usamos tu contenedor principal global */}
      
      {/* 2. ENCABEZADO ESTÁNDAR */}
      {/* ENCABEZADO PRINCIPAL (AZUL) */}
      <header className="App-header">
        <h1>Historial de Goles 2026</h1>
      </header>

      {/* FRANJA SECUNDARIA (ROJA - Igual de alta que la de Blue Archive) */}
      <div className="App-subheader">
        {/* Aquí puedes poner botones de filtro en el futuro, texto, o dejarla vacía */}
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main>
        <div className="matches-container">
          {partidosAgrupados.map((partido, index) => {
            
            const bgClass = index % 2 === 0 ? 'bg-gris-tenue' : 'bg-blanco-roto';

            return (
              <div key={partido.id} className={`match-section ${bgClass}`}>
                <div className="cards-wrapper">
                  {partido.goles.map((gol) => (
                    <GoalCard key={gol.id} data={gol} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. PIE DE PÁGINA ESTÁNDAR */}
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Idolmastercode – Proyecto Chivas. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}

export default App;