import React from 'react';
 
 interface TitleTextProps {
   data: {
     label: string;
   };
 }
 
 const TitleText: React.FC<TitleTextProps> = ({ data }) => {
   return (
     <div className='w-full h-full p-2 border-b-2 text-start b-[#555555] rounded-t-lg'>
      <h2 className='text-2xl text-[#555555]'>{data.label}</h2>  
     </div>
   );
 };
 
 export default TitleText;