import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";


interface CarouserProps {
    icon: React.ReactNode;
    content: string;
}


export function Carouser({data} : {data: CarouserProps[]}) {


  const [carouselKey, setCarouselKey] = useState(0);
  const carouselRef = useRef(null);

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
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
       
      <Button variant="outline" className="w-min" onClick={handleReset}>Start</Button>
    </div>
  );
}

export default Carouser;



