import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquareWarning, SendHorizonal, LoaderCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSimulator } from "@/context/shared/SimulatorContext";
import AIContext from "./gemini_context.md?raw";
import AIRules from "./gemini_rules.md?raw";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

const aiContext = AIContext;
const aiRules = AIRules;

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
  const { textProgram } = useSimulator();
  const { currentInst } = useCurrentInst();

  const popoverRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragStartInfo = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(direction);
    if (popoverRef.current) {
      dragStartInfo.current = {
        x: e.clientX,
        y: e.clientY,
        width: popoverRef.current.offsetWidth,
        height: popoverRef.current.offsetHeight,
      };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !popoverRef.current) return;

    const dx = e.clientX - dragStartInfo.current.x;
    const dy = e.clientY - dragStartInfo.current.y;

    let newWidth = dragStartInfo.current.width;
    let newHeight = dragStartInfo.current.height;

    if (isResizing.includes("left")) {
      newWidth = dragStartInfo.current.width - dx;
    }
    if (isResizing.includes("top")) {
      newHeight = dragStartInfo.current.height - dy;
    }
    
    const minWidth = 320;
    const maxWidth = window.innerWidth * 0.95;
    const minHeight = 200;
    const maxHeight = window.innerHeight * 0.95;

    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    if (newHeight < minHeight) newHeight = minHeight;
    if (newHeight > maxHeight) newHeight = maxHeight;

    popoverRef.current.style.width = `${newWidth}px`;
    popoverRef.current.style.height = `${newHeight}px`;
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const callGeminiAPI = async (currentQuestion: string) => {
    if (!currentQuestion) return;

    setLoading(true);
    setAiResponse("Thinking...");

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
        parts: [{
          text: `
          Rules:${aiRules}
          Context:${aiContext}
          Current program being simulated:${textProgram}
          Curent instruction being executed:${JSON.stringify(currentInst)}
          ` }],
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
          ref={popoverRef}
          className="w-80 mr-4 flex flex-col gap-4 p-4 z-[10000] relative max-h-[90vh] 
                     bg-neutral-100 border border-neutral-300 text-neutral-900 
                     dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
          align="end">
          
          <div
            onMouseDown={(e) => handleMouseDown(e, "left")}
            className="absolute top-0 left-0 h-full w-2 cursor-ew-resize z-10"
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, "top")}
            className="absolute top-0 left-0 w-full h-2 cursor-ns-resize z-10"
          />
          <div
            onMouseDown={(e) => handleMouseDown(e, "top-left")}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-10"
          />

          <div className="space-y-2 flex-shrink-0">
            <h4 className="font-medium leading-none">Ask the AI</h4>
          </div>

          <div
            className="flex-1 rounded-md border overflow-y-auto
                            border-neutral-300 bg-neutral-50 p-3 text-sm
                            dark:border-neutral-700 dark:bg-neutral-800/50">
            {loading && aiResponse === "Thinking..." && (
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