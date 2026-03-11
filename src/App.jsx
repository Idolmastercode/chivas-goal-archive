import React, { useMemo } from 'react';
import GoalCard from './components/GoalCard';
import golesData from './goles.json';
import './App.css'; // <-- Importamos tu CSS

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
  
  // Ordenamos y luego agrupamos los goles por partido
  const partidosAgrupados = useMemo(() => {
    // 1. Ordenar (Tu lógica intacta, está perfecta)
    const golesOrdenados = [...golesData].sort((a, b) => {
      const fechaA = parseFecha(a.fecha);
      const fechaB = parseFecha(b.fecha);
      if (fechaA.getTime() !== fechaB.getTime()) return fechaB - fechaA; 
      return parseMinuto(b.minuto) - parseMinuto(a.minuto);
    });

    // 2. Agrupar por partido
    const grupos = [];
    let partidoActualKey = "";

    golesOrdenados.forEach((gol) => {
      // Creamos un identificador único para cada partido
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
    <div className="app-container">
      <h2 className="header-title">
        Historial de Goles 2026
      </h2>

      {/* Contenedor principal de los partidos */}
      <div className="matches-container">
        {partidosAgrupados.map((partido, index) => {
          
          // Magia de la cebra: Alternamos clases en vez de colores en línea
          const bgClass = index % 2 === 0 ? 'bg-gris-tenue' : 'bg-blanco-roto';

          return (
            <div key={partido.id} className={`match-section ${bgClass}`}>
              
              {/* Opcional: Un pequeño título discreto del partido para separar visualmente */}
              {/* <h3 className="match-title">{partido.nombrePartido}</h3> */}

              <div className="cards-wrapper">
                {partido.goles.map((gol) => (
                  <GoalCard key={gol.id} data={gol} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;