import { useState } from "react";
import { MessageSquareWarning, SendHorizonal, LoaderCircle } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSimulator } from "@/context/shared/SimulatorContext";

import contextoIA from "./gemini_context.md?raw";

const CONTEXTO_IA = contextoIA;

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
  const { textProgram } = useSimulator()

  console.log({ "program": textProgram, "context": CONTEXTO_IA });


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
    <div className="fixed bottom-5 right-5" id="gemini-chat">
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
