// pages/auth/signup/components/SignupWithId.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../styles/signupWithId.module.scss';
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';

const SignupWithId = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const handleInputChange = (e) => {
    const { name, value }= e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setAgreements(prev => ({
        ...prev,
        [name]: checked
    }));
  };


  useEffect(() => {
    const isValid =
      formData.userId.length >= 5 &&
      formData.password.length >= 8 &&
      formData.password === formData.passwordConfirm &&
      agreements.terms &&
      agreements.privacy;

    setIsFormValid(isValid);
  }, [formData, agreements]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <div className={styles.form}>
          <div className={styles.form__title}>
          <i className='bx bx-chevron-left' onClick={() => navigate(-1)}></i>
            <span>회원가입</span>
          </div>

          <div className={styles.form__content}>
            <div className={styles.inputGroup}>
              <label>아이디<span className={styles.required}>*</span></label>
              <div className={styles.inputWithButton}>
                <input type="text" name="userId" value={formData.userId} onChange={handleInputChange} placeholder="5~20자 영문 혹은 영문+숫자 조합" />
                <button type="button">중복확인</button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>비밀번호<span className={styles.required}>*</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="비밀번호를 입력해주세요" />
            </div>

            <div className={styles.inputGroup}>
              <label>비밀번호 확인<span className={styles.required}>*</span></label>
              <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleInputChange} placeholder="비밀번호를 다시 입력해주세요" />
              <p className={styles.inputHint}>비밀번호는 8자 이상, 2개 이상 문자를 조합해주세요.</p>
            </div>

            <div className={styles.agreement}>
              <h2 className={styles.agreement__title}>
                시니어잡고 이용을 위한<br />
                약관에 <span>동의</span>해주세요.
              </h2>
                
              <div className={styles.agreement__items}>
                <div className={styles.agreement__item}>
                  <label htmlFor="terms">
                    플랫폼 이용약관 
                    <span className={styles.required}>&#91;필수&#93;</span>
                  </label>
                  <input type="checkbox" id="terms" name="terms" checked={agreements.terms} onChange={handleCheckboxChange} />
                </div>
                <div className={styles.agreement__item}>
                  <label htmlFor="privacy">
                    개인정보 수집 및 이용 동의
                    <span className={styles.required}>&#91;필수&#93;</span>
                  </label>
                  <input type="checkbox" id="privacy" name="privacy" checked={agreements.privacy} onChange={handleCheckboxChange} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.form__footer}>
            <button type="submit" className={styles.submitButton} disabled={!isFormValid}>
              가입하기
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignupWithId;