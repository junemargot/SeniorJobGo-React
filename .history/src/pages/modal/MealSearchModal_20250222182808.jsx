import React, { useState, useEffect } from 'react';
import styles from './styles/JobSearchModal.module.scss';
import MealCard from '../chat/components/MealCard';

const MealSearchModal = ({ isOpen, onClose, handleSubmit: submitHandler, userProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(!userProfile);
  const [isRecording, setIsRecording] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [mealPostings, setMealPostings] = useState([]);

  const searchTags = ['#강남구무료급식소', '#종로구무료급식소', '#영등포구무료급식소', '#용산구무료급식소'];

  const [errors, setErrors] = useState({
    searchQuery: false,
  });

  useEffect(() => {
    if (userProfile) {
      setIsEditing(false);
    }
  }, [userProfile]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      searchQuery: !searchQuery.trim(),
    };

    setErrors(newErrors);
  
    // 필수 필드 검증
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    submitHandler(searchQuery).then(results => {
      setMealPostings(results);
    });
  };

  // 음성 인식 설정
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSearchQuery(text);
      setIsRecording(false);
      setCurrentField(null);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setCurrentField(null);
    };

    setIsRecording(true);
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{userProfile ? '맞춤 정보 확인' : '무료급식소 검색'}</h2>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={`${styles.formGroup} ${errors.searchQuery ? styles.hasError : ''}`}>
            <label>검색어<span className={styles.required}>*</span></label>
            <div className={styles.voiceInputGroup}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!isEditing}
                placeholder="지역명을 입력해주세요. (예: 강남구)"
              />
              <button
                type="button"
                className={`${styles.voiceButton} ${currentField === 'searchQuery' ? styles.recording : ''}`}
                onClick={startVoiceRecognition}
                disabled={!isEditing}
              >
                <span className="material-symbols-rounded">
                  {currentField === 'searchQuery' ? 'mic' : 'mic_none'}
                </span>
              </button>
            </div>
            {errors.searchQuery && <p className={styles.errorText}>지역명을 입력해주세요.</p>}
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

        {mealPostings.length > 0 && (
          <div className={styles.cardList}>
            {mealPostings.map((meal, index) => (
              <MealCard
                key={index}
                meal={{
                  name: meal.name,
                  address: meal.address,
                  phoneNumber: meal.phone,
                  operatingHours: meal.operatingHours,
                  operatingDays: meal.description,
                  targetGroup: meal.targetGroup
                }}
                onClick={() => console.log(`Clicked on ${meal.name}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealSearchModal; 