import React from 'react';
 
 interface TitleTextProps {
   data: {
     label: string;
   };
 }
 
 const TitleText: React.FC<TitleTextProps> = ({ data }) => {
   return (
     <div className='w-full h-full p-2 rounded-t-lg border-b-1 text-start'>
      <h2 className='text-4xl text-[#555555]'>{data.label}</h2>  
     </div>
   );
 };
 
 export default TitleText;