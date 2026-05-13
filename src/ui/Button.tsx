import styles from './styles/Button.module.css';

interface ButtonProps{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  onClick?: () => void;
}

export const Button = ({ 
  children, 
  variant = 'primary',
  className,
    onClick,
}: ButtonProps) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
