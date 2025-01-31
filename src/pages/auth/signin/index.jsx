// pages/auth/signin/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/signin.module.scss';
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [saveId, setSaveId] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 컴포넌트 마운트 시 저장된 아이디 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem('savedUserId');
    if (savedId) {
      setFormData(prev => ({ ...prev, userId: savedId }));
      setSaveId(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage(''); // 입력 시 에러 메시지 초기화
  };

  const handleSaveIdChange = (e) => {
    setSaveId(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem('savedUserId');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 여기에 실제 로그인 로직 구현
    // 임시 검증 로직
    if (formData.userId === 'test' && formData.password === 'test123') {
      if (saveId) {
          localStorage.setItem('savedUserId', formData.userId);
      }
      navigate('/main'); // 로그인 성공 시 메인 페이지로 이동
    } else {
      setErrorMessage('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <div className={styles.signin}>
          <div className={styles.signin__title}>
            <i className='bx bx-chevron-left' onClick={() => navigate(-1)}></i>
            <span>로그인</span>
          </div>
            
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.form__content}>
              <div className={styles.inputGroup}>
                <label>아이디</label>
                <input type="text" name="userId" value={formData.userId} onChange={handleInputChange} placeholder="아이디를 입력해주세요" />
              </div>

              <div className={styles.inputGroup}>
                <label>비밀번호</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="비밀번호를 입력해주세요" />
              </div>

              {errorMessage && (
                <p className={styles.errorMessage}>{errorMessage}</p>
              )}

              <div className={styles.options}>
                <label className={styles.saveId}>
                  <input type="checkbox" checked={saveId} onChange={handleSaveIdChange} />
                  <span>아이디 저장</span>
                </label>
                <button type="button" className={styles.findAccount} onClick={() => navigate('/find-account')}>
                  아이디/비밀번호 찾기
                </button>
              </div>
            </div>

            <div className={styles.form__footer}>
              <button type="submit" className={styles.submitButton} disabled={!formData.userId || !formData.password}>
                로그인
              </button>
              <button type="button" className={styles.signupButton} onClick={() => navigate('/signup')}>
                회원가입
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signin;
