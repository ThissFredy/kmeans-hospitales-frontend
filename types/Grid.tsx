export interface GridProps {
	m?: number;
	n?: number;
	A?: number;
}

export interface Houses {
	data: [number, number][];
}

export interface Hospitals {
	hospitals: [number, number][];
}

export interface Clusters {
	clusters: number[];
}

export interface UpdatedHospitals {
	updatedHospitals: [number, number][];
}

export interface GridState {
	state: boolean;
	m: number;
	n: number;
	A: number;
	data: [number, number][];
}
