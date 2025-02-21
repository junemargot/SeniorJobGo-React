import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/mealService.module.scss';

const MealServiceMessage = ({ message }) => {
  const [expandedId, setExpandedId] = useState(null);

  const handleHeaderClick = (index, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === index ? null : index);
  };

  const formatWeekDays = (dateStr) => {
    if(!dateStr) return '';

    // 요일 배열
    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

    // '+'로 분리하고 각 요일만 추출
    const days = dateStr.split('+').map(day => day.trim());

    // 연속된 평일인지 확인
    const isWeekDays = days.length === 5 && days.every(day => weekdays.includes(day));
  
    if(isWeekDays) {
      return "평일(월, 화, 수, 목, 금)"
    }

    // 연속된 요일 찾기
    let result = [];
    let streak = [days[0]];
    
    for (let i = 1; i < days.length; i++) {
      const currIndex = weekdays.indexOf(days[i]);
      const prevIndex = weekdays.indexOf(days[i-1]);
      
      if (currIndex === prevIndex + 1) {
        streak.push(days[i]);
      } else {
        if (streak.length >= 3) {
          result.push(`${streak[0]}~${streak[streak.length-1]}`);
        } else {
          result.push(...streak);
        }
        streak = [days[i]];
      }
    }
    
    // 마지막 streak 처리
    if (streak.length >= 3) {
      result.push(`${streak[0]}~${streak[streak.length-1]}`);
    } else {
      result.push(...streak);
    }
    
    return result.join(', ');
  };

  return (
    <div className={styles.mealServiceMessage}>
      <p className={styles.messageText}>{message.text}</p>
      {message.data && (
        <div className={styles.cardList}>
          {message.data.map((item, index) => (
            <div 
              key={index} 
              className={`${styles.card} ${expandedId === index ? styles.expanded : ''}`}
            >
              <div 
                className={styles.cardHeader}
                onClick={(e) => handleHeaderClick(index, e)}
              >
                <h4 className={styles.facilityName}>{item.name}</h4>
                <span className={`material-symbols-rounded ${styles.icon}`}>
                  {expandedId === index ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {expandedId === index && (
                <div 
                  className={styles.cardContent}
                  onClick={(e) => e.stopPropagation()} // 컨텐츠 클릭 시 이벤트 전파 중단
                >
                  <div className={styles.infoRow}>
                    <span className={styles.label}>주소:</span>
                    <span className={styles.value}>{item.address}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>전화번호:</span>
                    <span className={styles.value}>{item.phoneNumber}</span>
                  </div>
                  {item.date && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>급식요일:</span>
                      <span className={styles.value}>{formatWeekDays(item.date)}</span>
                    </div>
                  )}
                  {item.time && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>급식시간:</span>
                      <span className={styles.value}>{item.time}</span>
                    </div>
                  )}
                  {item.target && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>급식대상:</span>
                      <span className={styles.value}>{item.target}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

MealServiceMessage.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      location: PropTypes.string,
      address: PropTypes.string.isRequired,
      date: PropTypes.string,
      time: PropTypes.string,
      target: PropTypes.string,
      phoneNumber: PropTypes.string
    }))
  }).isRequired
};

export default MealServiceMessage; 