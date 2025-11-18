import { GridProps, Houses, Hospitals, Clusters } from '@/types/Grid';
import { ResponseType } from '@/types/ResponseType';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // TODO: Change if needed

// Default timeout for fetch requests (ms)
const DEFAULT_FETCH_TIMEOUT_MS = 5000; // 5 seconds

/**
 * Wrapper around fetch that supports a timeout using AbortController.
 * Returns the same Response object as fetch or throws on timeout/network errors.
 */
async function fetchWithTimeout(
	input: RequestInfo,
	init?: RequestInit,
	timeoutMs = DEFAULT_FETCH_TIMEOUT_MS
) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const mergedInit = {
			...(init || {}),
			signal: controller.signal,
		} as RequestInit;
		const response = await fetch(input, mergedInit);
		return response;
	} finally {
		clearTimeout(id);
	}
}

export async function setMGrid(params: GridProps): Promise<ResponseType> {
	let data = { m: params.m };
	console.log('Data to be sent:', data);
	try {
		console.log(
			'Calling API: ',
			`${API_BASE_URL}/config/set-grid`,
			' with params:',
			params.m
		);
		const response = await fetchWithTimeout(`${API_BASE_URL}/config/set-grid`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Error: ${response.status} ${response.statusText}`,
			};
		}

		console.log('Response from server:', await response.clone().json());

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

export async function setNData(params: GridProps): Promise<ResponseType> {
	try {
		console.log(
			'Calling API: ',
			`${API_BASE_URL}/init/generate-data`,
			' with params:',
			params.n
		);
		const response = await fetchWithTimeout(
			`${API_BASE_URL}/init/generate-data`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ n: params.n }),
			}
		);

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

export async function setHospitals(params: GridProps): Promise<ResponseType> {
	try {
		console.log(
			'Calling API: ',
			`${API_BASE_URL}/init/generate-hospitals`,
			' with params:',
			params.A
		);
		const response = await fetchWithTimeout(
			`${API_BASE_URL}/init/generate-hospitals`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ A: params.A }),
			}
		);

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
		console.log('Calling API: ', `${API_BASE_URL}/run/assign-clusters`);
		const response = await fetchWithTimeout(
			`${API_BASE_URL}/run/assign-clusters`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

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
		console.log('Calling API: ', `${API_BASE_URL}/run/update-hospitals`);
		const response = await fetchWithTimeout(
			`${API_BASE_URL}/run/update-hospitals`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

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

export async function getMetricsApi(): Promise<ResponseType> {
	try {
		console.log('Calling API: ', `${API_BASE_URL}/run/metrics`);
		const response = await fetchWithTimeout(`${API_BASE_URL}/run/metrics`, {
			method: 'GET',
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

export async function getStatus(): Promise<ResponseType> {
	try {
		console.log('Calling API: ', `${API_BASE_URL}/status`);
		const response = await fetchWithTimeout(`${API_BASE_URL}/status`, {
			method: 'GET',
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
