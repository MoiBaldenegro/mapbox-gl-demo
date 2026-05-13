import styles from './styles/Header.module.css';

interface HeaderProps {
  logo?: string | React.ReactNode;
  children?: React.ReactNode;
}

const Header = ({ logo = '🐝 Busbee', children }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>{logo}</div>
      {children && <nav className={styles.nav}>{children}</nav>}
    </header>
  );
};

export default Header;