import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/commonCard.module.scss';
import MealCard from './MealCard';

const MealServiceMessage = ({ message, onMealCardClick, selectedMeal }) => {
  const handleMealCardClick = (meal) => {
    if(selectedMeal && selectedMeal?.name === meal.name) {
      onMealCardClick(null);
    } else {
      onMealCardClick(meal);
    }
  };
  
  return (
    <div className={styles.mealServiceMessage}>
      <p className={styles.messageText}>{message.message}</p>
      {message.mealPostings && message.mealPostings.length > 0 && (
        <div className={styles.cardList}>
          {message.mealPostings.map((item, index) => (
            <MealCard
              key={index}
              meal={{
                name: item.name,
                address: item.address,
                phoneNumber: item.phone,
                operatingHours: item.operatingHours,
                operatingDays: item.description,
                targetGroup: item.targetGroup
              }}
              onClick={handleMealCardClick}
              isSelected={ selectedMeal && selectedMeal?.name === item.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

MealServiceMessage.propTypes = {
  message: PropTypes.shape({
    message: PropTypes.string.isRequired,
    mealPostings: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      phone: PropTypes.string,
      operatingHours: PropTypes.string,
      targetGroup: PropTypes.string,
      description: PropTypes.string
    }))
  }).isRequired
};

export default MealServiceMessage;