import styles from './Header.module.scss';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const [Buttons, setButtons] = useState(null);

  useEffect(() => {
      // 쿠키에 로그인 정보가 있다면 로그아웃 버튼 표시
      const cookie = document?.cookie;
      const isLoggedIn = cookie.includes("sjgid");

      if (isLoggedIn) {
        const handleLogout = () => {
          document.cookie = "sjgid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          navigate('/');
        }

        const logoutButton = <button className={styles.logoutButton} onClick={handleLogout}>로그아웃</button>
        setButtons(logoutButton);
      }
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.headerLogo}>
          <span onClick={() => navigate('/')}>시니어JobGo</span>
        </h1>
        <div className={styles.headerButtons}>
          {Buttons}
        </div>
      </div>
    </header>
  );
};

export default Header;