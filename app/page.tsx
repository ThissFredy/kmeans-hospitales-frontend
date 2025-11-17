'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/button';
import Card from '@/components/card';
import GridVisualization from '@/components/grid';

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

export default function HospitalPlacementOptimizer() {
  const [gridSize, setGridSize] = useState(10);
  const [numResidences, setNumResidences] = useState(50);
  const [numFacilities, setNumFacilities] = useState(3);
  const [residences, setResidences] = useState<Residence[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [step, setStep] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);

  // Assign residences to nearest facility
  const assignResidencesToFacilities = () => {
    const updated = residences.map((residence) => {
      let minDist = Infinity;
      let nearestFacilityId = 0;

      facilities.forEach((facility) => {
        const dist = Math.hypot(residence.x - facility.x, residence.y - facility.y);
        if (dist < minDist) {
          minDist = dist;
          nearestFacilityId = facility.id;
        }
      });

      return { ...residence, clusterId: nearestFacilityId };
    });

    setResidences(updated);
    setStep(step + 1);
  };

  // Recalculate facility positions based on mean of assigned residences
  const updateFacilities = () => {
    const newFacilities = facilities.map((facility) => {
      const assignedResidences = residences.filter((r) => r.clusterId === facility.id);

      if (assignedResidences.length === 0) {
        return facility;
      }

      const meanX =
        assignedResidences.reduce((sum, r) => sum + r.x, 0) / assignedResidences.length;
      const meanY =
        assignedResidences.reduce((sum, r) => sum + r.y, 0) / assignedResidences.length;

      return {
        ...facility,
        x: Math.round(meanX),
        y: Math.round(meanY),
      };
    });

    setFacilities(newFacilities);
    setStep(step + 1);
    setIsOptimized(true);
  };

  const resetVisualization = () => {
    setResidences([]);
    setFacilities([]);
    setStep(0);
    setIsOptimized(false);
  };

  useEffect(() => {
     const initializeGrid = () => {
      const newResidences: Residence[] = [];
      for (let i = 0; i < numResidences; i++) {
        newResidences.push({
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
          clusterId: null,
        });
      }

    const newFacilities: Facility[] = [];
    for (let i = 0; i < numFacilities; i++) {
      newFacilities.push({
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
        id: i,
      });
    }

    setResidences(newResidences);
    setFacilities(newFacilities);
    setStep(0);
    setIsOptimized(false);
  };
  
    initializeGrid();
  }, [numResidences, numFacilities, gridSize]);

  const getAverageCoverage = () => {
    if (residences.length === 0 || facilities.length === 0) return 0;
    
    let totalDistance = 0;
    residences.forEach((residence) => {
      if (residence.clusterId !== null) {
        const facility = facilities.find(f => f.id === residence.clusterId);
        if (facility) {
          const dist = Math.hypot(residence.x - facility.x, residence.y - facility.y);
          totalDistance += dist;
        }
      }
    });
    
    const avgDistance = totalDistance / residences.length;
    return avgDistance.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Healthcare Facility Optimizer</h1>
          <p className="text-muted-foreground text-lg">
            Optimize hospital and medical facility placement using clustering algorithms to minimize average distance to residential areas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Controls */}
          <Card className="p-6 h-fit lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Configuration</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Grid Size (units)</label>
                <input
                  type="number"
                  value={gridSize}
                  onChange={(e) => setGridSize(Math.max(5, parseInt(e.target.value) || 5))}
                  disabled={step > 0}
                  className="w-full px-3 py-2 border border-input rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Residential Areas</label>
                <input
                  type="number"
                  value={numResidences}
                  onChange={(e) => setNumResidences(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={step > 0}
                  className="w-full px-3 py-2 border border-input rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Facilities to Place</label>
                <input
                  type="number"
                  value={numFacilities}
                  onChange={(e) => setNumFacilities(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={step > 0}
                  className="w-full px-3 py-2 border border-input rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Generate Layout
                </Button>

                <Button
                  onClick={assignResidencesToFacilities}
                  disabled={residences.length === 0}
                  className="w-full"
                >
                  Assign Areas
                </Button>

                <Button
                  onClick={updateFacilities}
                  disabled={residences.length === 0 || residences.every((r) => r.clusterId === null)}
                  className="w-full"
                >
                  Optimize Placement
                </Button>

                <Button onClick={resetVisualization} variant="destructive" className="w-full">
                  Reset
                </Button>
              </div>

              {/* Statistics */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Iteration:</span>
                    <span className="text-sm font-semibold text-foreground">{step}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Areas Mapped:</span>
                    <span className="text-sm font-semibold text-foreground">{residences.filter(r => r.clusterId !== null).length}/{residences.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Facilities:</span>
                    <span className="text-sm font-semibold text-foreground">{facilities.length}</span>
                  </div>
                  {isOptimized && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Avg Distance:</span>
                      <span className="text-sm font-semibold text-accent">{getAverageCoverage()} units</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Grid Visualization */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-card">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Coverage Map</h2>
                <p className="text-sm text-muted-foreground">
                  {isOptimized ? '✓ Optimized' : 'Configure and generate to begin optimization'}
                </p>
              </div>
              <GridVisualization
                gridSize={gridSize}
                residences={residences}
                facilities={facilities}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
