import type { MouseEventHandler, ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	onClick?: MouseEventHandler<HTMLButtonElement>;
	children: ReactNode;
	variant?: 'outline' | 'destructive';
	disabled?: boolean;
	className?: string;
}

export default function Button({
	children,
	onClick,
	disabled,
	className,
}: ButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`hover:cursor-pointer hover:scale-103 transition-all ${className ? className : ''}`}
		>
			{children}
		</button>
	);
}
