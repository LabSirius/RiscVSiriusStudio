import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOperation } from "@/context/OperationContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { File, Play, Cpu } from "lucide-react";

const data = [
  {
    icon: <File  strokeWidth={1}  width={28} height={28}/>,
    content: "Use a file with the .asm extension and place your instructions there."
  },
  {
    icon: < Play  strokeWidth={1}  width={28} height={28}/>,
    content: "Press the play button to start the conversion process."
  },
  {
    icon: <Cpu strokeWidth={1}  width={28} height={28}/>,
    content: "If you want to see the simulation press the CPU icon."
  }
]

export function FirstHelp() {

  const { operation } = useOperation();
  const navigate = useNavigate();

  const [carouselKey, setCarouselKey] = useState(0);
  const carouselRef = useRef(null);

   useEffect(() => {
      if (operation === 'uploadMemory') {
        navigate('/settings');
      }
  }, [operation, navigate]);

  const handleReset = () => {
    setCarouselKey((prev) => prev + 1);
  };


  return (
    <div className="flex flex-col gap-4">
      <Carousel key={carouselKey} ref={carouselRef} className="max-w-7/12">
        <CarouselContent >
          {data.map((item, index) => (
            <CarouselItem key={index} className="relative">
              <div className="p-1">
                <Card>
                  <CardContent className="flex items-center justify-center p-6 aspect-square">
                    <span className="font-semibold ">{item.content}</span>
                    <div className="absolute bottom-8 right-4">
                      {item.icon}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Los controles internos del carousel */}
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
       
      <Button variant="outline" className="w-min" onClick={handleReset}>Start</Button>
    </div>
  );
}

export default FirstHelp;



{data.map((item, index) => (
  <CarouselItem key={index}>
    <Card>
      <CardContent className="flex items-center gap-4">
        {item.icon}
        <p>{item.content}</p>
      </CardContent>
    </Card>
  </CarouselItem>
))}