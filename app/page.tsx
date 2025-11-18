'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/button';
import Card from '@/components/card';
import GridVisualization from '@/components/grid';
import {
	Clusters,
	GridProps,
	GridState,
	Hospitals,
	Houses,
	UpdatedHospitals,
} from '@/types/Grid';

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

	const assignResidencesToFacilities = () => {
		const updated = residences.map((residence) => {
			let minDist = Infinity;
			let nearestFacilityId = 0;

			facilities.forEach((facility) => {
				const dist = Math.hypot(
					residence.x - facility.x,
					residence.y - facility.y
				);
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

	const updateFacilities = () => {
		const newFacilities = facilities.map((facility) => {
			const assignedResidences = residences.filter(
				(r) => r.clusterId === facility.id
			);

			if (assignedResidences.length === 0) {
				return facility;
			}

			const meanX =
				assignedResidences.reduce((sum, r) => sum + r.x, 0) /
				assignedResidences.length;
			const meanY =
				assignedResidences.reduce((sum, r) => sum + r.y, 0) /
				assignedResidences.length;

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
		initializeGrid();
	}, []);

	const getAverageCoverage = () => {
		if (residences.length === 0 || facilities.length === 0) return 0;

		let totalDistance = 0;
		residences.forEach((residence) => {
			if (residence.clusterId !== null) {
				const facility = facilities.find((f) => f.id === residence.clusterId);
				if (facility) {
					const dist = Math.hypot(
						residence.x - facility.x,
						residence.y - facility.y
					);
					totalDistance += dist;
				}
			}
		});

		const avgDistance = totalDistance / residences.length;
		return avgDistance.toFixed(2);
	};

	const getMappedResidences = () => {
		return residences.filter((r) => r.clusterId !== null).length;
	};

	return (
		<div className="min-h-screen">
			{/* Header */}
			<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-6 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Optimizador de Ubicación de Hospitales
							</h1>
							<p className="text-sm text-muted-foreground mt-1">
								Optimiza la ubicación de las instalaciones utilizando el
								algoritmo de agrupamiento K-means
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="w-full mx-auto px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
					{/* Configuration Card */}
					<div className="w-max-2 space-y-6">
						<Card className="p-6 shadow-sm rounded-md border-border/50 w-full bg-gray-100">
							<h2 className="text-lg font-semibold text-foreground mb-4">
								Configuración
							</h2>

							<div className="space-y-4">
								<div>
									<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
										Tamaño de la Cuadrícula
									</label>
									<input
										type="number"
										value={gridSize}
										onChange={(e) =>
											setGridSize(Math.max(5, parseInt(e.target.value) || 5))
										}
										disabled={step > 0}
										className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									/>
								</div>

								<div>
									<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
										Casas a Asignar
									</label>
									<input
										type="number"
										value={numResidences}
										onChange={(e) =>
											setNumResidences(
												Math.max(1, parseInt(e.target.value) || 1)
											)
										}
										disabled={step > 0}
										className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									/>
								</div>

								<div>
									<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
										Número de Hospitales
									</label>
									<input
										type="number"
										value={numFacilities}
										onChange={(e) =>
											setNumFacilities(
												Math.max(1, parseInt(e.target.value) || 1)
											)
										}
										disabled={step > 0}
										className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									/>
								</div>

								<div className="pt-2 space-y-2">
									<Button
										onClick={initializeGrid}
										variant="outline"
										className="w-full text-sm rounded-md bg-gray-400 p-2"
									>
										Generar Nueva Cuadrícula
									</Button>

									<Button
										onClick={assignResidencesToFacilities}
										disabled={residences.length === 0}
										className="w-full text-sm rounded-md bg-blue-300 p-2"
									>
										Asignar Casas a Hospitales
									</Button>

									<Button
										onClick={updateFacilities}
										disabled={
											residences.length === 0 ||
											residences.every((r) => r.clusterId === null)
										}
										className="w-full text-sm rounded-md bg-green-400 p-2"
									>
										Actualizar Ubicaciones de Hospitales
									</Button>

									<Button
										onClick={resetVisualization}
										variant="destructive"
										className="w-full text-sm rounded-md bg-red-300 p-2"
									>
										Reiniciar Visualización
									</Button>
								</div>
							</div>
						</Card>
						<div className="flex w-full gap-4 justify-center lg:flex-col lg:gap-6">
							{/* Metrics Card */}
							<Card className="p-6 shadow-sm border-border/50 w-full rounded-md bg-gray-100">
								<h3 className="text-sm font-semibold text-foreground mb-4">
									Metricas
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">Step</span>
										<span className="text-sm font-bold text-primary">
											{step}
										</span>
									</div>
									<div className="h-px bg-border/50" />
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">
											Areas Cubiertas
										</span>
										<span className="text-sm font-bold text-foreground">
											{getMappedResidences()}/{residences.length}
										</span>
									</div>
									<div className="h-px bg-border/50" />
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">
											Hospitales
										</span>
										<span className="text-sm font-bold text-foreground">
											{facilities.length}
										</span>
									</div>
									{isOptimized && (
										<>
											<div className="h-px bg-border/50" />
											<div className="flex justify-between items-center pt-1">
												<span className="text-xs text-muted-foreground">
													Distancia Promedio
												</span>
												<span className="text-sm font-bold text-accent">
													{getAverageCoverage()}
												</span>
											</div>
										</>
									)}
								</div>
							</Card>

							{/* Stats Card */}
							<Card className="p-6 shadow-sm border-border/50 w-full rounded-md bg-gray-100">
								<h3 className="text-sm font-semibold text-foreground mb-4">
									Estadisticas
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">
											Areas Cubiertas
										</span>
										<span className="text-sm font-bold text-primary">
											{(
												(getMappedResidences() / residences.length) *
												100
											).toFixed(0)}
											%
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">
											Estado
										</span>
										<span
											className={`text-sm font-bold text-foreground ${isOptimized ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}
										>
											{isOptimized ? '✓ Optimized' : 'In Progress'}
										</span>
									</div>
								</div>
							</Card>
						</div>
					</div>

					<div className="lg:col-span-3 space-y-6">
						{/* Main Visualization Card */}
						<Card className="p-8 shadow-sm border-border/50 rounded-md">
							<div className="mb-6">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-xl font-semibold text-foreground">
											Coverage Map
										</h2>
										<p className="text-sm text-muted-foreground mt-1">
											{isOptimized
												? '✓ Optimization complete'
												: 'Configure and generate to begin optimization'}
										</p>
									</div>
									<div className="px-3 py-1 bg-secondary rounded-full">
										<span className="text-xs font-medium text-foreground">
											{gridSize}×{gridSize} Grid
										</span>
									</div>
								</div>
							</div>
							<GridVisualization
								gridSize={gridSize}
								residences={residences}
								facilities={facilities}
							/>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
