'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/button'; // Asegúrate de que este botón acepte className extra
import toast from 'react-hot-toast';
import GridVisualization from '@/components/grid';
import Loading from '@/components/loadingSpinner';
import {
	setMGrid,
	setNData,
	setHospitals,
	getClusters,
	updateHospitals,
	getMetricsApi,
	getStatus,
} from '@/api/api';
// Importamos iconos para una UI profesional
import {
	LayoutGrid,
	Users,
	Building2,
	RefreshCw,
	Play,
	RotateCcw,
	Activity,
	MapPin,
	BarChart3,
	CheckCircle2,
} from 'lucide-react';

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
			setStep(1);
			toast.success('Grid configurado');
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
			setStep(2);
			toast.success('Población generada');
		} catch (error) {
			console.error(error);
			toast.error('Error generando casas');
		} finally {
			setLoading(false);
		}
	};

	// Obtener Métricas
	const getMetrics = async () => {
		try {
			const res = await getMetricsApi();
			if (!res.success) toast.error('Error: ' + res.message);
			setAverageDistance(res.data.average_distance);
			setInertia(res.data.inertia);
		} catch (error) {
			console.error(error);
		}
	};

	// Polling Backend Status
	useEffect(() => {
		const interval = setInterval(async () => {
			setStatusBackend('loading');
			const response = await getStatus();
			setStatusBackend(response.success ? 'success' : 'error');
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
			setStep(3);
			toast.success('Hospitales inicializados');
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
			setStep(4);
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
			setStep(5);
			toast.success('Centroides optimizados');
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
		setAverageDistance(0);
		setInertia(0);
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
			{/* Navbar Minimalista */}
			<header className="bg-white border-b border-slate-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="bg-indigo-600 p-2 rounded-lg">
							<Activity className="text-white w-5 h-5" />
						</div>
						<div>
							<h1 className="text-xl font-bold text-slate-800">
								Hospital AI Optimizer
							</h1>
							<p className="text-xs text-slate-500 hidden sm:block">
								Algoritmo K-Means para infraestructura urbana
							</p>
						</div>
					</div>

					{/* Indicador de estado del servidor */}
					<div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
						<div
							className={`w-2.5 h-2.5 rounded-full ${
								statusBackend === 'success'
									? 'bg-emerald-500 animate-pulse'
									: statusBackend === 'error'
										? 'bg-red-500'
										: 'bg-yellow-500'
							}`}
						/>
						<span className="text-xs font-medium text-slate-600">
							{statusBackend === 'success' ? 'Sistema Online' : 'Conectando...'}
						</span>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* COLUMNA IZQUIERDA: Panel de Control (30% ancho) */}
					<div className="lg:col-span-4 flex flex-col gap-6">
						{/* Tarjeta de Configuración */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
							<div className="p-4 border-b border-slate-100 bg-slate-50/50">
								<h2 className="font-semibold text-slate-700 flex items-center gap-2">
									<LayoutGrid className="w-4 h-4 text-indigo-500" />
									Configuración del Modelo
								</h2>
							</div>

							<div className="p-5 space-y-6">
								{/* Paso 1: Grid */}
								<div
									className={`transition-all duration-300 ${step > 0 ? 'opacity-50 pointer-events-none grayscale' : ''}`}
								>
									<label className="text-xs font-bold text-slate-500 uppercase flex justify-between mb-2">
										<span>Dimensiones (m x m)</span>
										{step > 0 && (
											<CheckCircle2 className="w-4 h-4 text-emerald-500" />
										)}
									</label>
									<div className="flex gap-2">
										<input
											type="number"
											value={size}
											onChange={(e) => setSize(parseInt(e.target.value))}
											disabled={step > 0}
											className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
										/>
										<Button
											onClick={handleSetGrid}
											disabled={step > 0 || loading}
											className="flex-1 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm py-2"
										>
											Crear Universo
										</Button>
									</div>
								</div>

								{/* Paso 2: Población */}
								<div
									className={`transition-all duration-300 ${step !== 1 && step < 1 ? 'opacity-30 pointer-events-none' : step > 1 ? 'opacity-50 pointer-events-none grayscale' : ''}`}
								>
									<label className="text-xs font-bold text-slate-500 uppercase flex justify-between mb-2">
										<span>Densidad Poblacional</span>
										{step > 1 && (
											<CheckCircle2 className="w-4 h-4 text-emerald-500" />
										)}
									</label>
									<div className="flex gap-2">
										<div className="relative w-24">
											<Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
											<input
												type="number"
												value={numResidences}
												onChange={(e) =>
													setNumResidences(parseInt(e.target.value))
												}
												disabled={step !== 1}
												className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
											/>
										</div>
										<Button
											onClick={handleGenerateResidences}
											disabled={step !== 1 || loading}
											className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm"
										>
											Generar Casas
										</Button>
									</div>
								</div>

								{/* Paso 3: Hospitales */}
								<div
									className={`transition-all duration-300 ${step !== 2 && step < 2 ? 'opacity-30 pointer-events-none' : step > 2 ? 'opacity-50 pointer-events-none grayscale' : ''}`}
								>
									<label className="text-xs font-bold text-slate-500 uppercase flex justify-between mb-2">
										<span>Centros de Salud</span>
										{step > 2 && (
											<CheckCircle2 className="w-4 h-4 text-emerald-500" />
										)}
									</label>
									<div className="flex gap-2">
										<div className="relative w-24">
											<Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
											<input
												type="number"
												value={numFacilities}
												onChange={(e) =>
													setNumFacilities(parseInt(e.target.value))
												}
												disabled={step !== 2}
												className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
											/>
										</div>
										<Button
											onClick={handleGenerateHospitals}
											disabled={step !== 2 || loading}
											className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm"
										>
											Ubicar Hospitales
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Tarjeta de Algoritmo */}
						<div
							className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${step < 3 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
						>
							<div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex items-center justify-between">
								<h2 className="font-semibold text-indigo-900 flex items-center gap-2">
									<RefreshCw className="w-4 h-4 text-indigo-600" />
									Iteración K-Means
								</h2>
								{step >= 3 && (
									<span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
										Fase Activa
									</span>
								)}
							</div>
							<div className="p-5 space-y-3">
								<Button
									onClick={handleAssignClusters}
									disabled={(step !== 3 && step !== 5) || loading}
									className={`w-full py-4 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all
                                        ${
																					step === 3 || step === 5
																						? 'bg-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
																						: 'bg-slate-100 text-slate-400'
																				}`}
								>
									{loading && (step === 3 || step === 5) ? (
										<RefreshCw className="animate-spin w-4 h-4" />
									) : (
										<Users className="w-4 h-4" />
									)}
									Asignar Pacientes a Hospital más Cercano
								</Button>

								<Button
									onClick={handleUpdateFacilities}
									disabled={step !== 4 || loading}
									className={`w-full py-4 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all
                                        ${
																					step === 4
																						? 'bg-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
																						: 'bg-slate-100 text-slate-400'
																				}`}
								>
									{loading && step === 4 ? (
										<RefreshCw className="animate-spin w-4 h-4" />
									) : (
										<MapPin className="w-4 h-4" />
									)}
									Recalcular Ubicación Óptima (Centroides)
								</Button>
							</div>
						</div>

						{/* Botón Reset */}
						{step > 0 && (
							<button
								onClick={handleReset}
								className="flex items-center justify-center gap-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 py-3 rounded-lg transition-colors text-sm font-medium"
							>
								<RotateCcw className="w-4 h-4" />
								Reiniciar Simulación
							</button>
						)}
					</div>

					{/* COLUMNA DERECHA: Visualización (70% ancho) */}
					<div className="lg:col-span-8 space-y-6">
						{/* Métricas Flotantes */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
								<div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
									<MapPin className="w-6 h-6" />
								</div>
								<div>
									<p className="text-xs text-slate-500 font-semibold uppercase">
										Distancia Prom.
									</p>
									<p className="text-xl font-bold text-slate-800">
										{averageDistance.toFixed(2)}{' '}
										<span className="text-xs font-normal text-slate-400">
											uds
										</span>
									</p>
								</div>
							</div>

							<div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
								<div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
									<BarChart3 className="w-6 h-6" />
								</div>
								<div>
									<p className="text-xs text-slate-500 font-semibold uppercase">
										Inercia (WCSS)
									</p>
									<p className="text-xl font-bold text-slate-800">
										{inertia.toFixed(2)}
									</p>
								</div>
							</div>

							<div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
								<div
									className={`p-3 rounded-lg ${step >= 3 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
								>
									<Activity className="w-6 h-6" />
								</div>
								<div>
									<p className="text-xs text-slate-500 font-semibold uppercase">
										Fase Actual
									</p>
									<p className="text-sm font-bold text-slate-800">
										{step < 3
											? 'Preparación'
											: step === 4
												? 'Clusterizado'
												: 'Optimizado'}
									</p>
								</div>
							</div>
						</div>

						{/* Canvas Principal */}
						<div className="bg-white rounded-xl shadow-lg border border-slate-200 relative flex flex-col">
							<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-xl opacity-80"></div>

							<div className="flex-1 p-6 flex items-center bg-slate-50/50">
								{step === 0 ? (
									<div className="text-center text-slate-400">
										<LayoutGrid className="w-16 h-16 mx-auto mb-4 opacity-20" />
										<p>Configura las dimensiones para iniciar el mapa</p>
									</div>
								) : (
									<GridVisualization
										gridSize={gridSize}
										residences={residences}
										facilities={facilities}
									/>
								)}
							</div>

							<div className="bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center text-xs text-slate-400">
								<span>Mapa Vectorial R{gridSize}</span>
								<div className="flex gap-4">
									<span className="flex items-center gap-1">
										<div className="w-2 h-2 bg-indigo-500 rounded-full"></div>{' '}
										Casas
									</span>
									<span className="flex items-center gap-1">
										<div className="w-2 h-2 bg-red-500 rounded-full"></div>{' '}
										Hospitales
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
