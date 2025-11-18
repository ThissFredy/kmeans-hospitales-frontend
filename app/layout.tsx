import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Implementación K-Means - Ubicación de Hospitales',
	description:
		'Optimización de la ubicación de hospitales utilizando el algoritmo K-Means.',
	icons: {
		icon: '/favicon.ico',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<Toaster
					position="top-right"
					toastOptions={{
						style: {
							background: '#363636',
							color: '#fff',
							padding: '30px',
							fontSize: '15px',
							borderRadius: '8px',
							minWidth: '350px',
							overflow: 'hidden',
						},
						success: {
							duration: 3000,
							style: {
								background: '#10B981',
							},
						},
						error: {
							duration: 5000,
							style: {
								background: '#EF4444',
							},
						},
					}}
				/>
			</body>
		</html>
	);
}
