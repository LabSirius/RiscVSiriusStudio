const TunnelContainer = ({ color } : {color: string}) => {
  return (
    <div className="relative w-[7rem] h-[2.7rem] left-[-.1rem]">
      <div
        className="absolute inset-0 bg-black"
        style={{
          clipPath:
            "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 0px 98%, 0px 0%)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute inset-[1px]"
        style={{
          backgroundColor: color,
          clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default TunnelContainer;