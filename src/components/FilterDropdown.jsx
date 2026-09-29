import React, { useState, useRef, useEffect } from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({ opciones, valorSeleccionado, onSeleccionar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button 
        className={`dropdown-button ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{valorSeleccionado.label}</span>
        <svg className={`chevron ${isOpen ? 'rotate' : ''}`} viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {opciones.map((grupo, i) => (
            <div key={i} className="dropdown-group">
              
              {grupo.isAction ? (
                <div 
                  className="dropdown-item action-item"
                  onClick={() => { onSeleccionar(grupo); setIsOpen(false); }}
                >
                  {grupo.label}
                </div>
              ) : (
                <div 
                  className="dropdown-group-title clickable-title"
                  onClick={() => { onSeleccionar(grupo); setIsOpen(false); }}
                >
                  {grupo.label}
                </div>
              )}

              {grupo.subOptions && grupo.subOptions.map((sub, j) => (
                <div 
                  key={j} 
                  className="dropdown-item sub-item"
                  onClick={() => { onSeleccionar(sub); setIsOpen(false); }}
                >
                  {sub.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;