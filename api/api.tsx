import { GridProps, Houses, Hospitals, Clusters } from '@/types/Grid';
import { ResponseType } from '@/types/ResponseType';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000'; // TODO: Change if needed

export async function setMGrid(params: GridProps): Promise<ResponseType> {
	try {
		console.log(
			'Calling API: ',
			`${API_BASE_URL}/config/set-grid`,
			' with params:',
			params
		);
		const response = await fetch(`${API_BASE_URL}/config/set-grid`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Error: ${response.status} ${response.statusText}`,
			};
		}

		return {
			success: true,
			message: 'Grid configuration set successfully',
			data: await response.json(),
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.message ? error.message : 'An unexpected error occurred',
		};
	}
}

export async function setNData(params: Houses): Promise<ResponseType> {
	try {
		console.log(
			'Calling API: ',
			`${API_BASE_URL}/init/generate-data`,
			' with params:',
			params
		);
		const response = await fetch(`${API_BASE_URL}/init/generate-data`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Error: ${response.status} ${response.statusText}`,
			};
		}

		return {
			success: true,
			message: 'Houses set successfully',
			data: await response.json(),
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.message ? error.message : 'An unexpected error occurred',
		};
	}
}

export async function setHospitals(params: Hospitals): Promise<ResponseType> {
	try {
		console.log(
			'Calling API: ',
			`${API_BASE_URL}/init/generate-hospitals`,
			' with params:',
			params
		);
		const response = await fetch(`${API_BASE_URL}/init/generate-hospitals`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Error: ${response.status} ${response.statusText}`,
			};
		}

		return {
			success: true,
			message: 'Houses set successfully',
			data: await response.json(),
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.message ? error.message : 'An unexpected error occurred',
		};
	}
}

export async function getClusters(): Promise<ResponseType> {
	try {
		console.log('Calling API: ', `${API_BASE_URL}/init/assign-clusters`);
		const response = await fetch(`${API_BASE_URL}/init/assign-clusters`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Error: ${response.status} ${response.statusText}`,
			};
		}

		return {
			success: true,
			message: 'Clusters gotten successfully',
			data: await response.json(),
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.message ? error.message : 'An unexpected error occurred',
		};
	}
}

export async function updateHospitals(): Promise<ResponseType> {
	try {
		console.log('Calling API: ', `${API_BASE_URL}/init/update-hospitals`);
		const response = await fetch(`${API_BASE_URL}/init/update-hospitals`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Error: ${response.status} ${response.statusText}`,
			};
		}

		return {
			success: true,
			message: 'Hospitals updated successfully',
			data: await response.json(),
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.message ? error.message : 'An unexpected error occurred',
		};
	}
}

export async function getState(): Promise<ResponseType> {
	try {
		console.log('Calling API: ', `${API_BASE_URL}/state`);
		const response = await fetch(`${API_BASE_URL}/state`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Error: ${response.status} ${response.statusText}`,
			};
		}

		return {
			success: true,
			message: 'Stategotten successfully',
			data: await response.json(),
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.message ? error.message : 'An unexpected error occurred',
		};
	}
}
