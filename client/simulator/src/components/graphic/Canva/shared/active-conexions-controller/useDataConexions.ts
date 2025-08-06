import { useMemo } from 'react';
import { useSimulator } from '@/context/shared/SimulatorContext';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import * as conexion from './dataConexions'

export const useDataConexions = () => {
  const { typeSimulator } = useSimulator(); // Para saber si es 'monocycle' o 'pipeline'
  const { currentInst, currentResult } = useCurrentInst();

  // Usamos useMemo para que este cálculo complejo solo se ejecute cuando cambie la instrucción.
  const disabledEdges = useMemo(() => {
    let targetEdges: string[] = [];
    if (!currentInst) return [];

    // El gran SWITCH se mueve aquí, dentro del hook.
    switch (currentInst.type) {
      case "R":
        if (typeSimulator === 'monocycle') {
          targetEdges = [
            ...conexion.muxARouteEdges,
            ...conexion.noImmediateEdges,
            ...conexion.muxBRouteEdges_R,
            // etc.
          ];
        } else {
          // Lógica para PIPELINE para la instrucción tipo R
          // Ejemplo: Quizás el camino es el mismo pero con un registro intermedio
          targetEdges = [ /* ...diferentes caminos para pipeline... */ ];
        }
        break;

      case "I":
        if (typeSimulator === 'monocycle') {
          // ... tu lógica actual para 'I'
        } else {
          // ... lógica para 'I' en pipeline
        }
        break;
      
      // ... resto de los cases
      case "B":
        // ... tu lógica actual para 'B'
        if (currentResult.buMux.signal === '0') {
            // ...
        } else {
            // ...
        }
        break;
    }
    return targetEdges;
  }, [currentInst, currentResult, typeSimulator]);

  return disabledEdges;
};