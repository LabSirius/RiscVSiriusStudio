
const lines = [
  { x1: 5, y1: 0, x2: 5, y2: 1000 },   // left
  { x1: 95, y1: 0, x2: 95, y2: 1000 }, // right
  { x1: 5, y1: 0, x2: 95, y2: 0 },     // top
  { x1: 5, y1: 1000, x2: 95, y2: 1000 } // bottom
];

const StageSeparator = () => {
  return (
    <div style={{ height: '100%', width: '9.5rem' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {lines.map((line, index) => (
          <line
            key={index}
            {...line}
            stroke="#cccccc"
            strokeWidth="4"
            strokeDasharray="20,15"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
};

export default StageSeparator;
