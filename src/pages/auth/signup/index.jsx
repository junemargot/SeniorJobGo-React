// pages/auth/signup/index.jsx
import { useNavigate } from "react-router-dom";
import styles from './styles/signup.module.scss';
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <div className={styles.intro}>
          <div className={styles.circles}>
            <div className={styles.circles__item1}></div>
            <div className={styles.circles__item2}></div>
            <h2 className={styles.intro__title}>
              <span>간편로그인으로</span><br />
              <span>빠르게 가입하세요</span>
            </h2>
            <div className={styles.circles__item3}></div>
          </div>
          <div className={styles.buttons}>
            <button className={styles.buttons__social}>
              <span className={styles.buttons__icon}>
                <i class='bx bxs-message-rounded'></i>
              </span>
              카카오로 시작하기
            </button>
            <button className={styles.buttons__social} onClick={() => navigate('/signup/id')}>
              간편 아이디로 시작하기
            </button>
          </div>
          <div className={styles.login}>
            <span>이미 가입하셨나요?</span>
            <button className={styles.login__link} onClick={() => navigate('/signin')}>
              로그인하기
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;