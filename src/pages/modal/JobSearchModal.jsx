import React, { useState, useEffect } from 'react';
import styles from './styles/JobSearchModal.module.scss';

const JobSearchModal = ({ isOpen, onClose, onSubmit, userProfile }) => {
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

  const ageGroups = ['40대', '50대', '60대', '70대', '80대', '90대'];
  const cities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
      setIsEditing(false);
    }
  }, [userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();
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
        <h2>{userProfile ? '맞춤 정보 확인' : '정보 입력'}</h2>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.formGroup}>
            <label>연령대</label>
            <div className={styles.ageButtons}>
              {ageGroups.map(age => (
                <button
                  key={age}
                  type="button"
                  className={`${styles.ageButton} ${formData.ageGroup === age ? styles.active : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, ageGroup: age }))}
                  disabled={!isEditing}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>성별</label>
            <div className={styles.genderButtons}>
              <button
                type="button"
                className={`${styles.genderButton} ${formData.gender === 'male' ? styles.active : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                disabled={!isEditing}
              >
                남자
              </button>
              <button
                type="button"
                className={`${styles.genderButton} ${formData.gender === 'female' ? styles.active : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                disabled={!isEditing}
              >
                여자
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>희망근무지역</label>
            <div className={styles.locationInputs}>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                disabled={!isEditing}
                required
              >
                <option value="">시/도 선택</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                disabled={!isEditing}
                placeholder="군/구 입력"
                
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>희망직종</label>
            <div className={styles.voiceInputGroup}>
              <input
                type="text"
                value={formData.jobType}
                onChange={(e) => setFormData(prev => ({ ...prev, jobType: e.target.value }))}
                disabled={!isEditing}
                required
                placeholder="예: 사무직"
              />
              <button
                type="button"
                className={`${styles.voiceButton} ${currentField === 'jobType' ? styles.recording : ''}`}
                onClick={() => startVoiceRecognition('jobType')}
                disabled={!isEditing}
              >
                <span className="material-symbols-rounded">
                  {currentField === 'jobType' ? 'mic' : 'mic_none'}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>경력사항</label>
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
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobSearchModal; 