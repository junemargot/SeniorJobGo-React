import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/commonCard.module.scss';

const MealCard = ({ meal, onClick, isSelected, cardRef }) => {
  console.log('MealCard - 받은 급식소 데이터:', meal);

  // 운영 상태를 계산하는 함수
  const getOperationStatus = () => {
    // 한국 시간으로 현재 시간 설정
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const currentDay = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    
    // 운영 요일 확인
    const operatingDays = meal.operatingDays?.split('+').map(day => day.trim()) || [];
    const isOperatingDay = operatingDays.includes(currentDay);
    
    if (!isOperatingDay) {
      return 'closed'; // 휴무
    }

    // 운영 시간 파싱
    const timeMatch = meal.operatingHours?.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      return 'ended'; // 시간 정보가 없으면 기본적으로 종료로 표시
    }

    const [_, startHour, startMin, endHour, endMin] = timeMatch;
    
    // 현재 시간
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;  // 분 단위로 변환

    // 운영 시작/종료 시간을 분 단위로 변환
    const startTime = parseInt(startHour) * 60 + parseInt(startMin);
    const endTime = parseInt(endHour) * 60 + parseInt(endMin);

    if (currentTime < startTime) {
      return 'preparing'; // 준비중
    } else if (currentTime > endTime) {
      return 'ended'; // 종료
    } else {
      return 'operating'; // 운영중
    }
  };

  // 상태에 따른 라벨 텍스트
  const getStatusLabel = (status) => {
    switch (status) {
      case 'operating':
        return '운영중';
      case 'preparing':
        return '준비중';
      case 'ended':
        return '종료';
      case 'closed':
        return '휴무';
      default:
        return '';
    }
  };

  const operationStatus = getOperationStatus();

  const formatWeekDays = (dateStr) => {
    if (!dateStr) return null;

    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
    const operatingDays = dateStr.split('+').map(day => day.trim());
    
    return weekdays.map(day => ({
      day,
      isOperating: operatingDays.includes(day)
    }));
  };

  const WeekdayDisplay = ({ dateStr }) => {
    const weekdayInfo = formatWeekDays(dateStr);
    
    if (!weekdayInfo) return null;

    return (
      <div className={styles.mealCard__weekdays}>
        {weekdayInfo.map(({ day, isOperating }) => (
          <span
            key={day}
            className={`${styles.weekdayBox} ${isOperating ? styles.active : styles.inactive}`}
          >
            {day}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.mealCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      data-meal-id={meal.name}
    >
      <div className={styles.mealCard__header}>
        <div className={styles.mealCard__facility}>
          <span className="material-symbols-rounded">restaurant</span>
          {meal.name}
        </div>
        <div className={`${styles.statusLabel} ${styles[operationStatus]}`}>
          {getStatusLabel(operationStatus)}
        </div>
      </div>

      <div className={styles.mealCard__details}>
        <div className={styles.mealCard__detail}>
          <span className="material-symbols-rounded">schedule</span>
          {meal.operatingHours}
        </div>
        <div className={styles.mealCard__detail}>
          <span className="material-symbols-rounded">location_on</span>
          {meal.address}
        </div>
      </div>

      <div className={`${styles.mealCard__description} ${isSelected ? styles.visible : ''}`}>
        <p data-label="시설명">{meal.name}</p>
        <p data-label="주소">{meal.address}</p>
        <p data-label="전화번호">{meal.phone || '정보 없음'}</p>
        <p data-label="운영시간">{meal.operatingHours}</p>
        <p data-label="급식대상">{meal.targetGroup}</p>
        <p data-label="운영요일">
          <WeekdayDisplay dateStr={meal.description} />
        </p>
      </div>
    </div>
  );
};

MealCard.propTypes = {
  meal: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    phone: PropTypes.string,
    operatingHours: PropTypes.string,
    description: PropTypes.string,
    targetGroup: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
  cardRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

export default MealCard; 