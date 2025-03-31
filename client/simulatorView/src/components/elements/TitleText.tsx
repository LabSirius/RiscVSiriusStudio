import React from 'react';

interface TitleTextProps {
  data: {
    label: string;
  };
}

const TitleText: React.FC<TitleTextProps> = ({ data }) => {
  return (
    <div style={{ 
        width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'flex-start',
      textAlign: 'left',
      paddingLeft: '5px'
    }}>
      {data.label}
    </div>
  );
};

export default TitleText;
