import './GoalCard.css';

// 1. Función para determinar la carpeta de la temporada
const obtenerCarpetaTemporada = (fechaStr) => {
  if (!fechaStr) return '';
  const [dia, mes, anio] = fechaStr.split('/');
  const mesNum = parseInt(mes, 10);
  const anioNum = parseInt(anio, 10);

  if (mesNum >= 7) {
    return `${anioNum}${anioNum + 1}`; 
  } else {
    return `${anioNum - 1}${anioNum}`; 
  }
};

// 2. Función para procesar la ruta final de la imagen
const obtenerRutaFoto = (rutaOriginal, fechaStr) => {
  if (!rutaOriginal || !fechaStr) return rutaOriginal;
  
  const carpetaTemporada = obtenerCarpetaTemporada(fechaStr);
  const nombreArchivo = rutaOriginal.split('/').pop();
  
  return `images/${carpetaTemporada}/${nombreArchivo}`;
};

const GoalCard = ({ data }) => {
  const getTag = () => {
    if (data.tipo === 'PENAL') return <span className="tag-penal"> (P)</span>;
    if (data.tipo === 'AUTOGOL') return <span className="tag-gec"> (GEC)</span>;
    return null;
  };

  return (
    <div className="goal-card">
      {/* Lado Izquierdo: Foto + Dorsal */}
      <div className="card-photo">
        {/* Aquí interceptamos la ruta usando las funciones de arriba */}
        <img src={obtenerRutaFoto(data.foto, data.fecha)} alt={data.nombre} />
        
        <div className="dorsal-tag">
          <span>{data.dorsal}</span>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3>{data.nombre}{getTag()}</h3>
          <span className="minute">{data.minuto}'</span>
        </div>
        
        <div className="card-details">
          {data.asistio && (
            <p className="truncate">
              <strong>Asistió:</strong> {data.asistio}
            </p>
          )}

          <p className="truncate"><strong>Partido:</strong> {data.partido}</p>
          <p className="truncate"><strong>Estadio:</strong> {data.estadio}</p>
          <p className="truncate"><strong>Competencia:</strong> {data.competencia}</p>
          <p className="date"><strong>Fecha:</strong> {data.fecha}</p>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;