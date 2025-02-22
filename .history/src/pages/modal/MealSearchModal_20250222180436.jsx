import React, { useState, useEffect } from 'react';
import styles from './styles/JobSearchModal.module.scss';

const MealSearchModal = ({ isOpen, onClose, onSubmit, userProfile }) => {
  const [formData, setFormData] = useState({
    ageGroup: '',
    gender: '',
    city: '',
    district: '',
    jobType: '',
    career: ''
  });
  const [isEditing, setIsEditing] = useState(!userProfile);
  const [isRecording, setIsRecording] = useState(false);
  const [currentField, setCurrentField] = useState(null);

  const ageGroups = ['40대', '50대', '60대', '70대', '80대~'];
  const cities = ['서울', '경기', '인천', '강원', '대전', '세종', '충남', '충북', '부산', '울산', '경남', '경북', '대구', '광주', '전남', '전북', '제주'];

  const [errors, setErrors] = useState({
    ageGroup: false,
    gender: false,
    district: false,
    city: false,
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
      setIsEditing(false);
    }
  }, [userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검증 업데이트
    const newErrors = {
      ageGroup: !formData.ageGroup,
      gender: !formData.gender,
      district: !formData.district,
      city: !formData.city,
    };

    setErrors(newErrors);
  
    // 필수 필드 검증
    if(Object.values(newErrors).some(error => error)) {
      return;
    }
    onSubmit(formData);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // 음성 인식 설정
  const startVoiceRecognition = (field) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, [field]: text }));
      setIsRecording(false);
      setCurrentField(null);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setCurrentField(null);
    };

    setIsRecording(true);
    setCurrentField(field);
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{userProfile ? '맞춤 정보 확인' : '무료급식소 검색'}</h2>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={`${styles.formGroup} ${errors.ageGroup ? styles.hasError : ''}`}>
        <label>검색<span className={styles.required}>*</span></label>
            
            
            {errors.ageGroup && <p className={styles.errorText}>연령대를 선택해주세요.</p>}
          </div>

          


          <div className={styles.formGroup}>
            <label>검색<span className={styles.required}>*</span></label>
            <div className={styles.voiceInputGroup}>
              <input
                type="text"
                value={formData.career}
                onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value }))}
                disabled={!isEditing}
                placeholder="예: 경리 3년"
              />
              <button
                type="button"
                className={`${styles.voiceButton} ${currentField === 'career' ? styles.recording : ''}`}
                onClick={() => startVoiceRecognition('career')}
                disabled={!isEditing}
              >
                <span className="material-symbols-rounded">
                  {currentField === 'career' ? 'mic' : 'mic_none'}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              취소
            </button>
            {userProfile && !isEditing ? (
              <>
                <button type="button" onClick={handleEdit} className={styles.editButton}>
                  수정하기
                </button>
                <button type="submit" className={styles.submitButton}>
                  검색하기
                </button>
              </>
            ) : (
              <button type="submit" className={styles.submitButton}>
                검색하기
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealSearchModal; 