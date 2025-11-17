'use client';

interface Residence {
  x: number;
  y: number;
  clusterId: number | null;
}

interface Facility {
  x: number;
  y: number;
  id: number;
}

interface GridVisualizationProps {
  gridSize: number;
  residences: Residence[];
  facilities: Facility[];
}

const COLORS = ['#E85D5D', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function GridVisualization({
  gridSize,
  residences,
  facilities,
}: GridVisualizationProps) {
  const cellSize = Math.max(20, Math.floor(500 / gridSize));
  const canvasSize = cellSize * gridSize;

  const getColorForCluster = (clusterId: number | null) => {
    if (clusterId === null) return '#CBD5E1';
    return COLORS[clusterId % COLORS.length];
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg 
        width={canvasSize + 2} 
        height={canvasSize + 2} 
        className="border border-border bg-white rounded-lg shadow-sm"
      >
        {/* Grid lines */}
        {Array.from({ length: gridSize + 1 }).map((_, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={i * cellSize}
              y1={0}
              x2={i * cellSize}
              y2={canvasSize}
              stroke="#E5E7EB"
              strokeWidth="0.5"
            />
            <line
              x1={0}
              y1={i * cellSize}
              x2={canvasSize}
              y2={i * cellSize}
              stroke="#E5E7EB"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Residences */}
        {residences.map((residence, idx) => (
          <circle
            key={`residence-${idx}`}
            cx={residence.x * cellSize + cellSize / 2}
            cy={residence.y * cellSize + cellSize / 2}
            r="3.5"
            fill={getColorForCluster(residence.clusterId)}
            opacity={residence.clusterId === null ? "0.4" : "0.8"}
          />
        ))}

        {/* Facilities */}
        {facilities.map((facility) => (
          <g key={`facility-${facility.id}`}>
            {/* Facility marker (cross/plus) */}
            <line
              x1={facility.x * cellSize + cellSize / 2 - 7}
              y1={facility.y * cellSize + cellSize / 2}
              x2={facility.x * cellSize + cellSize / 2 + 7}
              y2={facility.y * cellSize + cellSize / 2}
              stroke={COLORS[facility.id % COLORS.length]}
              strokeWidth="2.5"
            />
            <line
              x1={facility.x * cellSize + cellSize / 2}
              y1={facility.y * cellSize + cellSize / 2 - 7}
              x2={facility.x * cellSize + cellSize / 2}
              y2={facility.y * cellSize + cellSize / 2 + 7}
              stroke={COLORS[facility.id % COLORS.length]}
              strokeWidth="2.5"
            />
            {/* Circle background */}
            <circle
              cx={facility.x * cellSize + cellSize / 2}
              cy={facility.y * cellSize + cellSize / 2}
              r="9"
              fill="none"
              stroke={COLORS[facility.id % COLORS.length]}
              strokeWidth="1.5"
              opacity="0.5"
            />
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          <span className="text-muted-foreground">Residential Area (unassigned)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Facility Location</span>
        </div>
      </div>
    </div>
  );
}
