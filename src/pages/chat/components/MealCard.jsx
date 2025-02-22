import React from 'react';
import PropTypes from 'prop-types';
// import styles from '../styles/chat.module.scss';
import styles from '../styles/commonCard.module.scss';

const MealCard = ({ meal, onClick, isSelected, cardRef }) => {
  // 운영 상태를 계산하는 함수
  const getOperationStatus = () => {
    const now = new Date();
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
      return 'operating'; // 시간 정보가 없으면 기본적으로 운영중으로 표시
    }

    const [_, startHour, startMin, endHour, endMin] = timeMatch;
    const startTime = new Date();
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    const currentTime = now;

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
    if (!dateStr) {
      console.log('운영요일 데이터가 없습니다:', dateStr);
      return null;
    }

    console.log('운영요일 데이터:', dateStr);
    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
    const operatingDays = dateStr.split('+').map(day => day.trim());
    console.log('파싱된 운영요일:', operatingDays);
    
    return weekdays.map(day => ({
      day,
      isOperating: operatingDays.includes(day)
    }));
  };

  const WeekdayDisplay = ({ dateStr }) => {
    console.log('WeekdayDisplay에 전달된 데이터:', dateStr);
    const weekdayInfo = formatWeekDays(dateStr);
    
    if (!weekdayInfo) {
      console.log('weekdayInfo가 null입니다');
      return null;
    }

    console.log('최종 요일 정보:', weekdayInfo);
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

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(meal);
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`${styles.mealCard} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
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

      {/* 기본 정보 (항상 표시) */}
      <div className={styles.mealCard__basicInfo}>
        <p data-label="주소">{meal.address}</p>
        <WeekdayDisplay dateStr={meal.operatingDays} />
      </div>

      {/* 상세 정보 (선택된 경우에만 표시) */}
      <div className={`${styles.mealCard__description} ${isSelected ? styles.visible : ''}`}>
        <p data-label="시설명">{meal.name}</p>
        <p data-label="주소">{meal.address}</p>
        <p data-label="전화번호">{meal.phoneNumber || '정보 없음'}</p>
        <p data-label="운영시간">{meal.operatingHours}</p>
        <p data-label="급식대상">{meal.targetGroup}</p>
        <p data-label="운영요일">
          <WeekdayDisplay dateStr={meal.operatingDays} />
        </p>
      </div>
    </div>
  );
};

MealCard.propTypes = {
  meal: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string,
    operatingHours: PropTypes.string,
    operatingDays: PropTypes.string,
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