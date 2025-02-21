import React from 'react';
import styles from '../styles/AIAnalysis.module.scss';

export const AIAnalysis = ({ analysisData }) => {
  const { strengths, improvements, interview_tips } = analysisData;

  return (
    <div className={styles.analysisContainer}>
      <div className={styles.section}>
        <h3>💪 강점 분석</h3>
        <p>{strengths}</p>
      </div>

      <div className={styles.section}>
        <h3>✍️ 개선 제안</h3>
        <p>{improvements}</p>
      </div>

      <div className={styles.section}>
        <h3>🎯 면접 준비 팁</h3>
        <p>{interview_tips}</p>
      </div>
    </div>
  );
}; 