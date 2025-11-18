import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	disabled?: boolean;
}

export default function Button({ children, disabled, ...props }: ButtonProps) {
	return (
		<button disabled={disabled} {...props}>
			{children}
		</button>
	);
}
