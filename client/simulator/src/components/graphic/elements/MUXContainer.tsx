import { useSimulator } from '@/context/shared/SimulatorContext';
// Importa tu CSS

function Mux2_1() {
  const { operation } = useSimulator();
  const isUploadMemory = operation === "uploadMemory";

  return (
    // Aplicamos la clase que controla el "lift" al contenedor SVG
    <svg 
        className="svg-container-lift" 
        width="100%" 
        height="100%" 
        viewBox="0 0 90 220" 
        style={{ overflow: 'visible' }} // Importante para que la sombra no se corte
    >
      <defs>
        {/* La definición del filtro no cambia */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow 
            dx="0" 
            dy="10" 
            stdDeviation="10" 
            floodColor="#000" 
            floodOpacity="0.45" 
          />
        </filter>
      </defs>

      <polygon
        // Combinamos las clases de CSS
        className={`${isUploadMemory ? 'animate-border-pulse' : ''} polygon-shadow`}
        points="70,55 70,161.4 0,220 0,0"
        fill="none"
        stroke="#AAAAAA"
        strokeWidth="6"
        // Quitamos el filtro de aquí para que CSS lo controle
      />
    </svg>
  );
}

export default Mux2_1;