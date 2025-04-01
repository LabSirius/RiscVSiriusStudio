const TunnelContainer = () => {
  return (
    <div className="relative w-[6.2rem] h-[2.6rem]">

      <div
        className="absolute inset-0 bg-black"
        style={{
          clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 2px 98%, 2px 2%)",
          zIndex: 0, 
        }}
      />
      <div
        className="absolute inset-[2px] bg-[#FFFFAA]"
        style={{
          clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default TunnelContainer;
