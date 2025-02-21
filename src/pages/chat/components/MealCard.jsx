import React from 'react';
import styles from '../styles/chat.module.scss';

const MealCard = ({ meal, onClick, isSelected, cardRef }) => {
  return (
    <div
      ref={cardRef}
      className={`${styles.mealCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(meal)}
      data-meal-id={meal.name}
    >
      <div className={styles.mealCard__header}>
        <div className={styles.mealCard__facility}>
          <span className={`material-symbols-rounded`}>restaurant</span>
          {meal.name}
        </div>
      </div>
      
      <div className={styles.mealCard__info}>
        <p className={styles.mealCard__target}>{meal.targetGroup}</p>
        <p className={styles.mealCard__time}>{meal.operatingHours}</p>
        <p className={styles.mealCard__date}>{meal.description}</p>
      </div>

      <div className={`${styles.mealCard__description} ${isSelected ? styles.visible : ''}`}>
        <p data-label="시설명">{meal.name}</p>
        <p data-label="주소">{meal.address}</p>
        <p data-label="전화번호">{meal.phone || '정보 없음'}</p>
        <p data-label="운영시간">{meal.operatingHours}</p>
        <p data-label="급식대상">{meal.targetGroup}</p>
        <p data-label="운영일">{meal.description}</p>
      </div>
    </div>
  );
};

export default MealCard; 