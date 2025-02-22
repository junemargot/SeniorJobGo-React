import React, { useState, useEffect } from 'react';
import styles from './styles/PolicySearchModal.module.scss';
import { API_BASE_URL } from '@/config';

const PolicyCard = ({ policy }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.policyCard}>
      <div 
        className={styles.policyHeader} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>{policy.제목}</h3>
        <div className={styles.policyMeta}>
          <span>출처: {policy.출처}</span>
          <span>대상: {policy.지원_대상}</span>
        </div>
      </div>
      
      <div className={`${styles.policyDetails} ${isExpanded ? styles.expanded : ''}`}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <h4>주요 내용</h4>
            <p>{policy.주요_내용}</p>
          </div>
          <div className={styles.detailItem}>
            <h4>신청 방법</h4>
            <p>{policy.신청_방법}</p>
          </div>
          <div className={styles.detailItem}>
            <h4>연락처</h4>
            <p>{policy.연락처}</p>
          </div>
        </div>
        
        {policy.URL && (
          <div className={styles.actionButtons}>
            <a 
              href={policy.URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.viewButton}
            >
              자세히 보기
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const PolicySearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTags = ['고령층취업', '노인일자리', '고령취업', '노인복지'];

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/policy/search', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              user_message: searchQuery
          })
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPolicies(data.search_result.policies);
    } catch (error) {
        console.error('정책 검색 오류:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>정책 정보 검색</h2>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={`${styles.formGroup}`}>
            <label>검색어<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력해주세요"
              className={styles.searchInput}
              required
            />
          </div>

          <h4 className={styles.recommendationTitle}>추천 검색어</h4>
          <div className={styles.searchTags}>
            {searchTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={styles.tagButton}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              검색하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicySearchModal; 