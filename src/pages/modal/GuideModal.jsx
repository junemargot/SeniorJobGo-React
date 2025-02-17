import React from 'react';
import styles from './styles/GuideModal.module.scss';

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const guides = [
    {
      title: "AI 맞춤 검색",
      description: "AI가 회원님의 정보를 분석하여 맞춤형 채용정보와 훈련과정을 추천해드립니다.",
      icon: "search"
    },
    {
      title: "음성 대화",
      description: "마이크 버튼을 눌러 음성으로 편리하게 검색하실 수 있습니다.",
      icon: "mic"
    },
    {
      title: "실시간 채용정보",
      description: "최신 채용정보가 실시간으로 업데이트됩니다.",
      icon: "update"
    }
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>시니어JobGo 이용안내</h2>
        <div className={styles.guideList}>
          {guides.map((guide, index) => (
            <div key={index} className={styles.guideItem}>
              <span className="material-symbols-rounded">{guide.icon}</span>
              <div className={styles.guideText}>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default GuideModal; 