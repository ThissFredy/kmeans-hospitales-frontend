interface StatusProps {
	nombre: string;
	status: 'idle' | 'loading' | 'success' | 'error';
}
const Status = ({ status, nombre }: StatusProps) => {
	return (
		<div
			className={`p-4 m-4 border border-border rounded-lg shadow-sm w-full text-center ${
				status === 'idle'
					? 'bg-gray-100 text-gray-800'
					: status === 'loading'
						? 'bg-yellow-100 text-yellow-800'
						: status === 'success'
							? 'bg-green-100 text-green-800'
							: 'bg-red-100 text-red-800'
			}`}
		>
			<h3>{nombre}</h3>
			<p>{status}</p>
		</div>
	);
};

export default Status;
