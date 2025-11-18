'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/button';
import Status from '@/components/status';
import Card from '@/components/card';
import toast from 'react-hot-toast';
import GridVisualization from '@/components/grid'; // Tu nuevo componente visual
import {
	setMGrid,
	setNData,
	setHospitals,
	getClusters,
	updateHospitals,
	getMetricsApi,
	getStatus,
} from '@/api/api';

// Interfaces
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
	// --- Estados de Configuración ---
	const [gridSize, setGridSize] = useState(10);
	const [size, setSize] = useState(10);
	const [statusBackend, setStatusBackend] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>('loading');
	const [averageDistance, setAverageDistance] = useState(0);
	const [inertia, setInertia] = useState(0);
	const [numResidences, setNumResidences] = useState(50);
	const [numFacilities, setNumFacilities] = useState(3);

	// --- Estados del Modelo ---
	const [residences, setResidences] = useState<Residence[]>([]);
	const [facilities, setFacilities] = useState<Facility[]>([]);

	// --- Control de Flujo ---
	// 0: Inicio, 1: GridOK, 2: CasasOK, 3: HospitalesOK, 4: Asignado, 5: Actualizado
	const [step, setStep] = useState(0);
	const [loading, setLoading] = useState(false);

	// 1. Configurar Grid
	const handleSetGrid = async () => {
		setLoading(true);
		try {
			const res = await setMGrid({ m: size });
			if (!res.success) throw new Error(res.message);

			setGridSize(size);
			setResidences([]);
			setFacilities([]);
			setStep(1); // Avanzamos al paso 1
		} catch (error) {
			console.error(error);
			toast.error('Error configurando Grid');
		} finally {
			setLoading(false);
		}
	};

	// 2. Generar Casas
	const handleGenerateResidences = async () => {
		setLoading(true);
		try {
			const res = await setNData({ n: numResidences });
			if (!res.success) toast.error('Error: ' + res.message);

			const newResidences: Residence[] = res.data.data.map(
				(coords: [number, number]) => ({
					x: coords[0],
					y: coords[1],
					clusterId: null,
				})
			);

			setResidences(newResidences);
			setStep(2); // Avanzamos al paso 2
		} catch (error) {
			console.error(error);
			toast.error('Error generando casas');
		} finally {
			setLoading(false);
		}
	};

	// Obtener Métricas Iniciales

	const getMetrics = async () => {
		console.log('Fetching initial metrics...');
		try {
			const res = await getMetricsApi();
			if (!res.success) toast.error('Error: ' + res.message);
			console.log('Current State Metrics:', res.data);
			setAverageDistance(res.data.average_distance);
			setInertia(res.data.inertia);
		} catch (error) {
			console.error(error);
			toast.error('Error obteniendo métricas');
		}
	};

	// Funcion que se ejecuta cada 10 segundos para estado del backend
	useEffect(() => {
		const interval = setInterval(async () => {
			setStatusBackend('loading');
			const response = await getStatus();
			if (response.success) {
				setStatusBackend('success');
			} else {
				setStatusBackend('error');
			}
		}, 10000);

		return () => clearInterval(interval);
	}, []);

	// 3. Generar Hospitales
	const handleGenerateHospitals = async () => {
		setLoading(true);
		try {
			const res = await setHospitals({ A: numFacilities });
			if (!res.success) toast.error('Error: ' + res.message);

			const newFacilities: Facility[] = res.data.hospitals.map(
				(coords: [number, number], index: number) => ({
					x: coords[0],
					y: coords[1],
					id: index,
				})
			);

			setFacilities(newFacilities);
			setStep(3); // Avanzamos al paso 3 (Listo para empezar K-Means)
		} catch (error) {
			console.error(error);
			toast.error('Error generando hospitales');
		} finally {
			setLoading(false);
		}
	};

	// 4. Algoritmo: Asignar Clusters
	const handleAssignClusters = async () => {
		setLoading(true);
		try {
			const res = await getClusters();
			if (!res.success) toast.error('Error: ' + res.message);

			const clusterIndices = res.data.clusters;
			const updatedResidences = residences.map((res, i) => ({
				...res,
				clusterId: clusterIndices[i],
			}));

			setResidences(updatedResidences);
			setStep(4); // Bloqueamos "Asignar", habilitamos "Actualizar"
		} catch (error) {
			console.error(error);
			toast.error('Error asignando clusters');
		} finally {
			setLoading(false);
		}
	};

	// 5. Algoritmo: Actualizar Hospitales
	const handleUpdateFacilities = async () => {
		setLoading(true);
		try {
			const res = await updateHospitals();
			if (!res.success) toast.error('Error: ' + res.message);

			const newCoords = res.data.hospitals;
			const updatedFacilities = facilities.map((fac, i) => ({
				...fac,
				x: Math.round(newCoords[i][0]),
				y: Math.round(newCoords[i][1]),
			}));

			setFacilities(updatedFacilities);
			setStep(5); // Bloqueamos "Actualizar", habilitamos "Asignar" para iterar
		} catch (error) {
			console.error(error);
			toast.error('Error actualizando hospitales');
		} finally {
			setLoading(false);
			getMetrics();
		}
	};

	// Reiniciar
	const handleReset = () => {
		setResidences([]);
		setFacilities([]);
		setStep(0);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="border-b border-border bg-white sticky top-0 z-50">
				<div className=" mx-auto px-6 py-4">
					<h1 className="text-2xl font-bold text-gray-800">
						K-Means: Ubicación de Hospitales
					</h1>
					<div className="text-sm text-gray-500">
						Optimización de la ubicación de hospitales utilizando el algoritmo
						K-Means.
					</div>
				</div>
			</header>

			<main className="mx-auto px-6 py-8">
				<Status status={statusBackend} nombre="Estado del Backend" />
				<div className="flex">
					<div className="lg:col-span-4 flex flex-col gap-6 mr-6 w-full max-w-md">
						<Card className="p-6 bg-white shadow-xl border border-gray-200 rounded-xl">
							<h2 className="text-lg font-semibold mb-4 text-gray-700">
								Panel de Control
							</h2>

							<div className="space-y-6">
								{/* Paso 1: Grid */}
								<div
									className={`p-4 rounded-lg border ${step === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
								>
									<label className="text-xs font-bold text-gray-500 uppercase">
										1. Universo (m x m)
									</label>
									<div className="flex gap-2 mt-2">
										<input
											type="number"
											value={size}
											onChange={(e) => {
												setSize(parseInt(e.target.value));
											}}
											disabled={step > 0}
											className="w-20 px-2 py-1 border rounded bg-white disabled:text-gray-400"
										/>
										<Button
											onClick={handleSetGrid}
											disabled={step > 0 || loading} // Se bloquea si ya avanzamos
											className={`flex-1 text-sm rounded-md ${step > 0 ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-700'}`}
										>
											{step > 0 ? '✓ Listo' : 'Crear Grid'}
										</Button>
									</div>
								</div>

								{/* Paso 2: Casas */}
								<div
									className={`p-4 rounded-lg border ${step === 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
								>
									<label className="text-xs font-bold text-gray-500 uppercase">
										2. Población (n)
									</label>
									<div className="flex gap-2 mt-2">
										<input
											type="number"
											value={numResidences}
											onChange={(e) =>
												setNumResidences(parseInt(e.target.value))
											}
											disabled={step !== 1} // Solo activo en paso 1
											className="w-20 px-2 py-1 border rounded bg-white disabled:text-gray-400"
										/>
										<Button
											onClick={handleGenerateResidences}
											disabled={step !== 1 || loading}
											className={`flex-1 text-sm rounded-md ${step > 1 ? 'opacity-50 cursor-not-allowed' : step < 1 ? 'opacity-30' : 'bg-emerald-500 text-white hover:bg-emerald-700'}`}
										>
											{step > 1 ? '✓ Listo' : 'Generar Casas'}
										</Button>
									</div>
								</div>

								{/* Paso 3: Hospitales */}
								<div
									className={`p-4 rounded-lg border ${step === 2 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
								>
									<label className="text-xs font-bold text-gray-500 uppercase">
										3. Hospitales (A)
									</label>
									<div className="flex gap-2 mt-2">
										<input
											type="number"
											value={numFacilities}
											onChange={(e) =>
												setNumFacilities(parseInt(e.target.value))
											}
											disabled={step !== 2} // Solo activo en paso 2
											className="w-20 px-2 py-1 border rounded bg-white disabled:text-gray-400"
										/>
										<Button
											onClick={handleGenerateHospitals}
											disabled={step !== 2 || loading}
											className={`flex-1 text-sm rounded-md ${step > 2 ? 'opacity-50 cursor-not-allowed' : step < 2 ? 'opacity-30' : 'bg-emerald-500 text-white hover:bg-emerald-700'}`}
										>
											{step > 2 ? '✓ Listo' : 'Generar Hospitales'}
										</Button>
									</div>
								</div>

								<hr className="border-gray-200" />

								{/* Pasos Iterativos (4 y 5) */}
								<div className="space-y-3">
									<label className="text-xs font-bold text-gray-500 uppercase">
										Algoritmo K-Means
									</label>

									<Button
										onClick={handleAssignClusters}
										// Activo SOLO si estamos en paso 3 (inicial) o paso 5 (vuelta del bucle)
										disabled={(step !== 3 && step !== 5) || loading}
										className={`w-full py-3 text-sm rounded-md transition-colors ${
											step === 3 || step === 5
												? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
												: 'bg-gray-100 text-gray-400 cursor-not-allowed'
										}`}
									>
										{loading && (step === 3 || step === 5)
											? 'Calculando...'
											: '4. Asignar Clusters'}
									</Button>

									<Button
										onClick={handleUpdateFacilities}
										// Activo SOLO si estamos en paso 4
										disabled={step !== 4 || loading}
										className={`w-full py-3 text-sm rounded-md transition-colors ${
											step === 4
												? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
												: 'bg-gray-100 text-gray-400 cursor-not-allowed'
										}`}
									>
										{loading && step === 4
											? 'Moviendo...'
											: '5. Actualizar Centroides'}
									</Button>
								</div>

								<Button
									onClick={handleReset}
									variant="destructive"
									className="w-full mt-6 border-red-200 text-red-600 bg-red-50 hover:bg-red-200 p-2 rounded-md text-sm"
								>
									Reiniciar Todo
								</Button>
							</div>
						</Card>

						{/* Métricas */}
						<Card className="p-6 bg-white shadow-xl border border-gray-200 rounded-xl">
							<h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
								Estadísticas
							</h3>
							<div className="flex justify-between items-center py-2 border-b">
								<span className="text-sm text-gray-600">
									Distancia Promedio
								</span>
								<span className="font-mono font-bold text-indigo-600">
									{averageDistance.toFixed(2)} unidades
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b">
								<span className="text-sm text-gray-600">Inercia</span>
								<span className="font-mono font-bold text-indigo-600">
									{inertia.toFixed(2)} unidades
								</span>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="text-sm text-gray-600">Estado Actual</span>
								<span
									className={`text-xs font-bold px-2 py-1 rounded-full ${
										step < 3
											? 'bg-gray-100 text-gray-500'
											: step === 4
												? 'bg-indigo-100 text-indigo-700'
												: 'bg-emerald-100 text-emerald-700'
									}`}
								>
									{step < 3
										? 'Configuración'
										: step === 4
											? 'Clusterizado'
											: 'Centroides Actualizados'}
								</span>
							</div>
						</Card>
					</div>

					{/* COLUMNA DERECHA: Visualización */}
					<div className="lg:col-span-8">
						<Card className="p-8 bg-white shadow-xl border border-gray-200 rounded-xl flex flex-col items-center justify-center min-h-[600px]">
							<h2 className="text-xl font-semibold mb-6 self-start">
								Mapa de Cobertura
							</h2>

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
