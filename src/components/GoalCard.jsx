import './GoalCard.css';

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
        <img src={data.foto} alt={data.nombre} />
        
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