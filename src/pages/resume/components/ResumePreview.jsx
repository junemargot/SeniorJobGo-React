import React from 'react';
import styles from '../styles/ResumePreview.module.scss';

export const ResumePreview = ({ resumeData, aiGeneratedIntro }) => {
  return (
    <div className={styles.previewContainer}>
      <h2 className={styles.previewTitle}>이력서 미리보기</h2>
      
      <div className={styles.section}>
        <h3>기본 정보</h3>
        <div className={styles.basicInfo}>
          <p><strong>성함:</strong> {resumeData.name}</p>
          <p><strong>연락처:</strong> {resumeData.phone}</p>
          {resumeData.email && <p><strong>이메일:</strong> {resumeData.email}</p>}
        </div>
      </div>

      {resumeData.education?.length > 0 && (
        <div className={styles.section}>
          <h3>학력 사항</h3>
          {resumeData.education.map((edu, index) => (
            <div key={index} className={styles.item}>
              <p className={styles.itemTitle}>{edu.school}</p>
              <p className={styles.itemDetail}>{edu.year}년 {edu.degree}</p>
            </div>
          ))}
        </div>
      )}

      {resumeData.experience?.length > 0 && (
        <div className={styles.section}>
          <h3>경력 사항</h3>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className={styles.item}>
              <p className={styles.itemTitle}>{exp.company}</p>
              <p className={styles.itemSubtitle}>{exp.position}</p>
              <p className={styles.itemPeriod}>{exp.period}</p>
              <p className={styles.itemDescription}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {resumeData.desired_job?.length > 0 && (
        <div className={styles.section}>
          <h3>희망 직종</h3>
          <div className={styles.jobList}>
            {resumeData.desired_job.map((job, index) => (
              <span key={index} className={styles.jobItem}>{job}</span>
            ))}
          </div>
        </div>
      )}

      {resumeData.skills && (
        <div className={styles.section}>
          <h3>보유 기술 및 장점</h3>
          <p className={styles.content}>{resumeData.skills}</p>
        </div>
      )}

      <div className={styles.section}>
        <h3>자기소개</h3>
        {aiGeneratedIntro ? (
          <div className={styles.aiGeneratedContent}>
            <div className={styles.aiLabel}>AI 작성 자기소개서</div>
            <p className={styles.content}>{aiGeneratedIntro}</p>
          </div>
        ) : (
          <p className={styles.content}>{resumeData.additional_info}</p>
        )}
      </div>
    </div>
  );
}; 