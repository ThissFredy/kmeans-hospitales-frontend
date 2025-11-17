import type { MouseEventHandler, ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    children: ReactNode;
    variant?: 'outline' | 'destructive';
    disabled?: boolean;
}

export default function Button({children, onClick, disabled, variant, ...props}: ButtonProps) {

    return (
        <button onClick={onClick} disabled={disabled} className={`btn ${variant}`} {...props}>
            {children}
        </button>
    )
    
}
