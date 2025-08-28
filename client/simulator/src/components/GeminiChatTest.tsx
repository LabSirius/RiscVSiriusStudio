import { useState } from "react";
import { MessageSquareWarning, SendHorizonal, LoaderCircle } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CONTEXTO_IA = `
  ### Base de Conocimiento Avanzada:  Monociclo RV32

  **1. Filosofía y Componentes Clave**

  El procesador monociclo ejecuta una instrucción completa en un único ciclo de reloj. El flujo de datos atraviesa secuencialmente cinco etapas lógicas. Los componentes clave son:
  * **PC (Program Counter):** Apunta a la instrucción a ejecutar.
  * **Instruction Memory:** Almacén de solo lectura para las instrucciones.
  * **Control Unit:** El cerebro. Decodifica el opcode y genera todas las señales de control.
  * **Registers Unit:** Almacena los 32 registros de propósito general. Tiene dos puertos de lectura (para rs1, rs2) y un puerto de escritura (para rd).
  * **Imm Generator:** Extrae, decodifica y extiende en signo el valor inmediato de la instrucción a 32 bits.
  * **ALU (Arithmetic Logic Unit):** Realiza cálculos aritméticos y lógicos.
  * **Data Memory:** Almacén de lectura/escritura para los datos del programa.
  * **Multiplexores (MUX):** Son cruciales. Son interruptores controlados por las señales de la 'Control Unit':
      * **MUX de la ALU (controlado por ALUSrc):** Elige la segunda entrada de la ALU entre el registro 'rs2' y el valor del 'Imm Generator'.
      * **MUX de Escritura (controlado por RUDataWrSrc/MemtoReg):** Elige qué dato se escribirá en el registro: el resultado de la ALU ('ALURes') o el dato leído de la 'Data Memory'.
      * **MUX del PC (controlado por la Branch Unit):** Elige la siguiente dirección del PC: PC+4 (flujo normal) o la dirección de salto calculada (si un branch se toma).

  **2. Manejo de Pseudo-instrucciones (Traducción Previa)**

  Muchas instrucciones comunes son alias que el ensamblador convierte en instrucciones base.
  * nop (No Operation) -> addi x0, x0, 0
  * mv rd, rs1 (Move) -> addi rd, rs1, 0
  * not rd, rs (Bitwise Not) -> xori rd, rs, -1
  * j label (Jump) -> jal x0, label
  * ret (Return) -> jalr x0, x1, 0
  * call label (Call Subroutine) -> auipc ra, offset_upper; jalr ra, offset_lower(ra) (complejo)

  ---

  ### **3. Flujo Detallado por Tipo de Instrucción Base**

  #### **TIPO R (Register) - ej: \`add x5, x6, x7\`**
  * **Propósito:** Operaciones aritmético-lógicas entre dos registros.
  * **Señales de Control:** \`RegWrite=1\`, \`ALUSrc=0\`, \`MemRead=0\`, \`MemWrite=0\`, \`Branch=0\`, \`RUDataWrSrc=0\`.
  * **Flujo:**
      1.  **IF:** El PC (ej: \`h'4\`) direcciona la 'Instruction Memory', que devuelve la instrucción \`add\` (ej: \`h'007302B3\`). El sumador calcula PC+4 (ej: \`h'8\`).
      2.  **ID:** La instrucción se decodifica. La 'Control Unit' establece las señales. Los campos 'rs1' (\`x6\`) y 'rs2' (\`x7\`) leen sus valores del 'Registers Unit'.
      3.  **IE:** El valor de \`x6\` va a la entrada A de la ALU. Como **ALUSrc=0**, el MUX selecciona el valor de \`x7\` para la entrada B. La ALU, instruida por el 'ALUOp' derivado del 'funct3/funct7', realiza la suma. El resultado sale por 'ALURes'.
      4.  **MEM:** La 'Data Memory' está inactiva (\`MemRead=0\`, \`MemWrite=0\`). 'ALURes' pasa sin cambios.
      5.  **WB:** Como **RUDataWrSrc=0**, el MUX selecciona 'ALURes'. Como **RegWrite=1**, este resultado se escribe en el registro destino 'rd' (\`x5\`).

  #### **TIPO I (Immediate & Load)**
  * **a) Aritmética - ej: \`addi x9, x9, 10\`**
      * **Señales:** \`RegWrite=1\`, **\`ALUSrc=1\`**, \`MemRead=0\`, \`MemWrite=0\`, \`RUDataWrSrc=0\`.
      * **Flujo (Diferencia clave):** En la fase **IE**, como **ALUSrc=1**, el MUX selecciona el valor del 'Imm Generator' (el inmediato '10' extendido en signo) como segunda entrada de la ALU. El resto del flujo es análogo al Tipo R.
  * **b) Carga - ej: \`lw x10, 0(x11)\`**
      * **Señales:** \`RegWrite=1\`, \`ALUSrc=1\`, **\`MemRead=1\`**, \`MemWrite=0\`, **\`RUDataWrSrc=1\`**.
      * **Flujo:**
          1.  **IF/ID:** Similar a 'addi'. Se lee el registro base \`x11\` y se genera el inmediato '0'.
          2.  **IE:** La ALU se usa como calculadora de direcciones. Suma el valor de \`x11\` (entrada A) con el inmediato '0' (entrada B, seleccionada por \`ALUSrc=1\`). El 'ALURes' es la dirección de memoria final.
          3.  **MEM:** 'ALURes' se usa como dirección en la 'Data Memory'. Como **MemRead=1**, se lee el dato de esa dirección.
          4.  **WB:** Como **RUDataWrSrc=1**, el MUX selecciona el **dato leído de la memoria**. Como **RegWrite=1**, este dato se escribe en el registro destino 'rd' (\`x10\`).

  #### **TIPO S (Store) - ej: \`sw x2, 0(x2)\`**
  * **Propósito:** Guardar el valor de un registro en memoria.
  * **Señales:** **\`RegWrite=0\`**, \`ALUSrc=1\`, \`MemRead=0\`, **\`MemWrite=1\`**, \`Branch=0\`.
  * **Flujo:**
      1.  **ID:** Se leen DOS registros: \`rs1\` (\`x2\`, la dirección base) y \`rs2\` (\`x2\`, el dato a guardar).
      2.  **IE:** La ALU calcula la dirección de memoria sumando el valor de \`rs1\` y el inmediato (offset '0').
      3.  **MEM:** 'ALURes' (la dirección) se envía a la 'Data Memory'. El valor del registro \`rs2\` se envía al puerto de datos de escritura. Como **MemWrite=1**, el dato se almacena en la memoria.
      4.  **WB:** No ocurre nada. Como **RegWrite=0**, el 'Registers Unit' no es modificado.

  #### **TIPO B (Branch) - ej: \`beq x14, x15, label\`**
  * **Propósito:** Salto condicional.
  * **Señales:** \`RegWrite=0\`, \`ALUSrc=0\`, \`MemWrite=0\`, **\`Branch=1\`**.
  * **Flujo:**
      1.  **ID:** Se leen los registros a comparar (\`x14\`, \`x15\`). El 'Imm Generator' calcula el offset del 'label'.
      2.  **IE:** Los valores de \`x14\` y \`x15\` entran a la ALU (ya que \`ALUSrc=0\`). La ALU realiza una resta. La 'Branch Unit' analiza el resultado: si es CERO (y la instrucción es 'beq'), la condición de salto se cumple.
      3.  **IF/PC Update:** La decisión de la 'Branch Unit', junto con la señal **Branch=1**, controla el MUX del PC. Si el salto se toma, el PC se carga con la dirección de destino (PC actual + offset). Si no se toma, el PC se carga con PC+4.
      4.  **MEM/WB:** No hay operaciones en estas etapas.

  #### **TIPO U (Upper Immediate)**
  * **a) \`lui x16, 0x12345\` (Load Upper Immediate)**
      * **Propósito:** Cargar un inmediato de 20 bits en los 20 bits superiores de un registro.
      * **Señales:** \`RegWrite=1\`, \`ALUSrc=1\` (para pasar el inmediato), \`RUDataWrSrc=0\`.
      * **Flujo:**
          1.  **ID:** El 'Imm Generator' toma el inmediato de 20 bits (\`0x12345\`) y lo extiende a 32 bits añadiendo 12 ceros a la derecha (\`h'12345000\`).
          2.  **IE:** La ALU está configurada para simplemente pasar su entrada B (el inmediato generado) a la salida 'ALURes'. La entrada A (rs1) no se usa.
          3.  **WB:** El valor \`h'12345000\` de 'ALURes' se escribe en el registro destino 'rd' (\`x16\`).
  * **b) \`auipc x16, 0x12345\` (Add Upper Immediate to PC)**
      * **Señales:** \`RegWrite=1\`, \`ALUSrc=1\`, \`RUDataWrSrc=0\`.
      * **Flujo (Diferencia clave):**
          1.  **ID:** El 'Imm Generator' produce el mismo valor que en 'lui' (\`h'12345000\`).
          2.  **IE:** ¡Aquí está la diferencia! La ALU **suma** dos valores: la entrada A, que es el valor del **PC actual**, y la entrada B, que es el inmediato extendido. 'ALURes' es el resultado de (PC + inmediato << 12).
          3.  **WB:** El resultado de esa suma se escribe en el registro destino 'rd' (\`x16\`).

  #### **TIPO J (Jump) - ej: \`jal x1, label\`**
  * **Propósito:** Salto incondicional guardando la dirección de retorno.
  * **Señales:** \`RegWrite=1\`. El control del PC es la clave.
  * **Flujo:**
      1.  **IF:** Se lee la instrucción \`jal\` del PC actual. Se calcula PC+4.
      2.  **ID:** El 'Imm Generator' construye el offset de salto de 20 bits.
      3.  **PC Update:** El PC es actualizado incondicionalmente a (PC actual + offset de salto). Este es el 'Jump'.
      4.  **WB:** El valor **PC+4** (la dirección de la instrucción siguiente a \`jal\`) se escribe en el registro destino 'rd' (\`x1\`). Este es el 'Link' (enlace), que permite regresar después de una llamada a función. La fuente de este dato (PC+4) es un camino dedicado que no pasa por la 'Data Memory', por lo que \`RUDataWrSrc\` sería un valor especial (o '0' si el dato se enruta a través del path de la ALU).
`;

const REGLAS_IA = `
Actúa como un "Analista Experto en Simulación de Procesadores", especializado en el simulador del procesador RISC-V RV32I en implementación monociclo.

**Directrices Operativas:**

1) **Ámbito y modos de respuesta**
   - **Modo A – Análisis de instrucciones**: si la entrada es una instrucción RISC-V (base o pseudo), genera el análisis exhaustivo del flujo por IF, ID, IE, MEM, WB, con señales de control y efecto en el simulador.
   - **Modo B – Preguntas conceptuales**: si la entrada NO es una instrucción pero sí trata del simulador/arquitectura RV32I monociclo (p. ej., “¿qué es un simulador monociclo?”, “¿qué hace la Control Unit?”, “ventajas/desventajas”), responde con una explicación clara y concisa del concepto, citando componentes y su interacción.

2) **Referencias al datapath**
   - Cuando aplique, ancla tus explicaciones al datapath (PC, Instruction Memory, Registers, ImmGen, ALU, Data Memory, MUXes, Control Unit).
   - **Si no hay diagrama disponible**, describe el recorrido de datos y las señales **en texto**; no bloquees la respuesta por falta de figura.

3) **Señales de control (en Modo A)**
   - Especifica valores típicos (ALUSrc, MemRead, MemWrite, RegWrite, Branch, MemtoReg/RUDataWrSrc, ALUOp) y explica cómo afectan MUXes y unidades (p. ej.: “ALUSrc=1 selecciona inmediato para la entrada B de la ALU”).

4) **Pseudo-instrucciones (en Modo A)**
   - Si llega una pseudo, primero indícalo y tradúcela a la instrucción base; luego analiza la base.

5) **Formato para Modo A (siempre que la entrada sea una instrucción)**
   - IF, ID, IE, MEM, WB, con qué datos entran/salen y qué señales habilitan cada paso.

6) **Dominio exclusivo**
   - Te centras en **RV32I monociclo y su simulador**. Si te piden algo fuera de ese ámbito (x86, ARM, SOs), responde con cortesía que tu foco es RV32I monociclo. Si la pregunta es **general pero dentro del ámbito** (definiciones del simulador/datapath), **sí debes responder** (Modo B).

7) **Si la entrada es ambigua**
   - Pide una breve aclaración o asume el caso más probable y explica tu suposición.
`;

type HistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};

const GeminiChatWidget = () => {
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const callGeminiAPI = async (currentQuestion: string) => {
    if (!currentQuestion) return;

    setLoading(true);
    setAiResponse("Pensando...");

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const currentHistory = [
      ...history,
      {
        role: "user" as const,
        parts: [{ text: currentQuestion }],
      },
    ];

    const requestBody = {
      contents: currentHistory,
      system_instruction: {
        parts: [{ text: `${REGLAS_IA}\n\nContexto:\n${CONTEXTO_IA}` }],
      },
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Respuesta no válida o bloqueada por seguridad.");
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      setAiResponse(textResponse);

      setHistory([
        ...currentHistory,
        {
          role: "model" as const,
          parts: [{ text: textResponse }],
        },
      ]);
    } catch (error) {
      console.error("Hubo un error al llamar a Gemini:", error);
      setAiResponse("Lo siento, algo salió mal. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    callGeminiAPI(question);
    setQuestion("");
  };

  return (
    <div className="fixed bottom-5 right-5">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <MessageSquareWarning size={18} className="cursor-pointer" />
        </PopoverTrigger>
        <PopoverContent
          className="w-80 mr-4 flex flex-col gap-4 p-4 z-[10000]
                     max-h-[80vh] 
                     bg-neutral-100 border border-neutral-300 text-neutral-900 
                     dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
          align="end">
          <div className="space-y-2 flex-shrink-0">
            <h4 className="font-medium leading-none">Ask the AI</h4>
          </div>

          <div
            className="flex-1 rounded-md border overflow-y-auto
                            border-neutral-300 bg-neutral-50 p-3 text-sm
                            dark:border-neutral-700 dark:bg-neutral-800/50">
            {loading && aiResponse === "Pensando..." && (
              <div className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            {!aiResponse && <p>Waiting for your question...</p>}
            {aiResponse && !loading && (
              <div className="prose-sm prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
            <Input
              id="question"
              placeholder="How can I help you?"
              className="flex-1 
                           bg-neutral-50 border-neutral-300 outline-none
                           dark:bg-neutral-800 dark:border-neutral-700 "
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !question}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GeminiChatWidget;
