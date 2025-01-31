import styles from './Header.module.scss';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.headerLogo}>
          <span onClick={() => navigate('/')}>시니어JobGo</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;