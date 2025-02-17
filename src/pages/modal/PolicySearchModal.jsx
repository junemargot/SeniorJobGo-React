import React, { useState, useEffect } from 'react';
import styles from './styles/PolicySearchModal.module.scss';
import { samplePolicies } from '../../data/samplePolicies';

const PolicyCard = ({ policy, isExpanded, onClick }) => {
  return (
    <div className={`${styles.policyCard} ${isExpanded ? styles.expanded : ''}`} onClick={onClick}>
      <div className={styles.policyCard__header}>
        <div className={styles.policyCard__department}>
          <span className="material-symbols-rounded">account_balance</span>
          {policy.department}
        </div>
        <div className={styles.policyCard__date}>{policy.publishDate}</div>
      </div>
      
      <h3 className={styles.policyCard__title}>{policy.title}</h3>
      
      <div className={styles.policyCard__tags}>
        {policy.tags.map((tag, index) => (
          <span key={index} className={styles.policyCard__tag}>#{tag}</span>
        ))}
      </div>

      <div className={`${styles.policyCard__content} ${isExpanded ? styles.visible : ''}`}>
        <p><strong>지원대상</strong> {policy.target}</p>
        <p><strong>지원내용</strong> {policy.support}</p>
        <p><strong>신청방법</strong> {policy.howToApply}</p>
        <p><strong>신청기간</strong> {policy.applicationPeriod}</p>
        <p><strong>문의처</strong> {policy.contact}</p>
        <p className={styles.policyCard__description}>{policy.description}</p>
        
        <div className={styles.policyCard__footer}>
          <div className={styles.policyCard__source}>
            출처: {policy.department}
          </div>
          <a
            href={policy.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.policyCard__link}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-rounded">open_in_new</span>
            자세히 보기
          </a>
        </div>
      </div>
    </div>
  );
};

const PolicySearchModal = ({ isOpen, onClose }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [sortedPolicies, setSortedPolicies] = useState([]);

  useEffect(() => {
    // 정책 정보를 날짜순으로 정렬
    const sorted = [...samplePolicies].sort((a, b) => 
      new Date(b.publishDate) - new Date(a.publishDate)
    );
    setSortedPolicies(sorted);
  }, []);

  const handleCardClick = (policyId) => {
    setExpandedId(expandedId === policyId ? null : policyId);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>정책 정보</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className={styles.policyList}>
          {sortedPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              isExpanded={expandedId === policy.id}
              onClick={() => handleCardClick(policy.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicySearchModal; 