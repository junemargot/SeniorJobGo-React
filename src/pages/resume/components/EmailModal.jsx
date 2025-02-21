import React, { useState } from 'react';
import styles from '../styles/EmailModal.module.scss';

export const EmailModal = ({ onClose, onSubmit, name }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>이력서 전송</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">받으실 이메일 주소</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              전송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 