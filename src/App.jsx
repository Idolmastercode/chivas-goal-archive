import React, { useMemo, useState } from 'react';
import GoalCard from './components/GoalCard';
import FilterDropdown from './components/FilterDropdown';
import golesData from './goles.json';
import './App.css'; 

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

const obtenerCarpetaTemporada = (fechaStr) => {
  if (!fechaStr) return '';
  const [dia, mes, anio] = fechaStr.split('/');
  const mesNum = parseInt(mes, 10);
  const anioNum = parseInt(anio, 10);
  if (mesNum >= 7) return `${anioNum}${anioNum + 1}`; 
  return `${anioNum - 1}${anioNum}`; 
};

const obtenerRutaFoto = (rutaOriginal, fechaStr, tipo) => {
  if (tipo === 'AUTOGOL') return 'images/autogol.jpg';
  if (!rutaOriginal || !fechaStr) return rutaOriginal;
  const carpetaTemporada = obtenerCarpetaTemporada(fechaStr);
  const nombreArchivo = rutaOriginal.split('/').pop();
  return `images/${carpetaTemporada}/${nombreArchivo}`;
};

const generarMenuDinamico = (data) => {
  const seasonsMap = {};

  data.forEach(gol => {
    const carpeta = obtenerCarpetaTemporada(gol.fecha); 
    const anioInicio = carpeta.substring(0, 4);
    const anioFin = carpeta.substring(4, 8);

    if (!seasonsMap[carpeta]) {
      seasonsMap[carpeta] = {
        label: `Temporada ${anioInicio}-${anioFin}`,
        value: `${carpeta}-ALL`,
        temporadaFolder: carpeta,
        anioInicio: parseInt(anioInicio),
        competitions: {}
      };
    }

    const baseComp = gol.competencia; 
    const golDate = parseFecha(gol.fecha).getTime();

    if (!seasonsMap[carpeta].competitions[baseComp]) {
      let displayLabel = baseComp;
      if (baseComp.includes('Apertura')) {
        displayLabel = `Liga MX - Apertura ${anioInicio}`;
      } else if (baseComp.includes('Clausura')) {
        displayLabel = `Liga MX - Clausura ${anioFin}`;
      }

      seasonsMap[carpeta].competitions[baseComp] = {
        label: displayLabel,
        value: `${carpeta}-${baseComp.replace(/[^a-zA-Z0-9]/g, '')}`, 
        temporadaFolder: carpeta,
        keyword: baseComp, 
        maxDate: golDate 
      };
    } else {
      if (golDate > seasonsMap[carpeta].competitions[baseComp].maxDate) {
        seasonsMap[carpeta].competitions[baseComp].maxDate = golDate;
      }
    }
  });

  const sortedSeasons = Object.values(seasonsMap).sort((a, b) => b.anioInicio - a.anioInicio);
  const menuFinal = [{ label: "Mostrar Histórico Completo", value: "TODO", isAction: true }];

  sortedSeasons.forEach(season => {
    const sortedComps = Object.values(season.competitions).sort((a, b) => b.maxDate - a.maxDate);
    menuFinal.push({
      label: season.label,
      value: season.value,
      temporadaFolder: season.temporadaFolder,
      subOptions: sortedComps
    });
  });

  return menuFinal;
};

const opcionesMenuDinamicas = generarMenuDinamico(golesData);

function App() {
  const [filtroActual, setFiltroActual] = useState(opcionesMenuDinamicas[1] || opcionesMenuDinamicas[0]); 

  const golesFiltrados = useMemo(() => {
    if (filtroActual.value === 'TODO') return [...golesData];

    return golesData.filter((gol) => {
      const carpeta = obtenerCarpetaTemporada(gol.fecha);
      const coincideTemporada = carpeta === filtroActual.temporadaFolder;
      
      if (filtroActual.keyword) {
        return coincideTemporada && gol.competencia === filtroActual.keyword; 
      }
      return coincideTemporada;
    });
  }, [filtroActual]);

  const stats = useMemo(() => {
    const conteoGoles = {};
    const conteoAsistencias = {};
    let fotoGoleador = 'images/default.jpg';
    let fotoAsistidor = 'images/default.jpg';

    golesFiltrados.forEach(gol => {
      if (gol.tipo !== 'AUTOGOL') {
        conteoGoles[gol.nombre] = (conteoGoles[gol.nombre] || 0) + 1;
      }
      if (gol.asistio) {
        conteoAsistencias[gol.asistio] = (conteoAsistencias[gol.asistio] || 0) + 1;
      }
    });

    const arrGoleadores = Object.entries(conteoGoles).sort((a, b) => b[1] - a[1]);
    const arrAsistidores = Object.entries(conteoAsistencias).sort((a, b) => b[1] - a[1]);

    const topGoleador = arrGoleadores[0] || ["N/A", 0];
    const topAsistidor = arrAsistidores[0] || ["N/A", 0];

    if (topGoleador[0] !== "N/A") {
      const registro = golesFiltrados.find(g => g.nombre === topGoleador[0]);
      fotoGoleador = obtenerRutaFoto(registro.foto, registro.fecha, registro.tipo);
    }
    
    if (topAsistidor[0] !== "N/A") {
      const registro = golesData.find(g => g.nombre === topAsistidor[0]);
      if (registro) fotoAsistidor = obtenerRutaFoto(registro.foto, registro.fecha, registro.tipo);
    }

    return {
      total: golesFiltrados.length,
      goleador: { 
        nombreCompleto: topGoleador[0],
        nombre: topGoleador[0].split(' ').pop(), 
        goles: topGoleador[1], 
        foto: fotoGoleador 
      },
      asistidor: { 
        nombreCompleto: topAsistidor[0],
        nombre: topAsistidor[0].split(' ').pop(), 
        asistencias: topAsistidor[1], 
        foto: fotoAsistidor 
      }
    };
  }, [golesFiltrados]);

  const partidosAgrupados = useMemo(() => {
    const golesOrdenados = [...golesFiltrados].sort((a, b) => {
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
  }, [golesFiltrados]); 

  return (
    <div className="App"> 
      <header className="App-header">
        <h1>Historial de Goles</h1>
      </header>

      <div className="App-subheader">
        <div className="subheader-content">
          
          <div className="subheader-filters">
            <FilterDropdown 
              opciones={opcionesMenuDinamicas} 
              valorSeleccionado={filtroActual}
              onSeleccionar={(seleccion) => setFiltroActual(seleccion)}
            />
            <div className="stat-total-rect">
              <span className="number">{stats.total}</span>
              <span className="label">Goles</span>
            </div>
          </div>

          <div className="subheader-stats">
            
            <div className="stat-pill-circular with-tooltip" data-tooltip={stats.goleador.nombreCompleto}>
              <img src={stats.goleador.foto} alt="Goleador" className="stat-photo-circle" />
              <div className="stat-info">
                <span className="label">Goleador</span>
                <div className="name-val">
                  {stats.goleador.nombre} <span className="stat-number">{stats.goleador.goles}</span>
                </div>
              </div>
            </div>

            <div className="stat-pill-circular with-tooltip" data-tooltip={stats.asistidor.nombreCompleto}>
              <img src={stats.asistidor.foto} alt="Asistidor" className="stat-photo-circle" />
              <div className="stat-info">
                <span className="label">Asistidor</span>
                <div className="name-val">
                  {stats.asistidor.nombre} <span className="stat-number">{stats.asistidor.asistencias}</span>
                </div>
              </div>
            </div>

            <button className="btn-pro-circle with-tooltip" data-tooltip="Ver estadísticas detalladas">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

          </div>

        </div>
      </div>

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

      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Idolmastercode – Proyecto Chivas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;