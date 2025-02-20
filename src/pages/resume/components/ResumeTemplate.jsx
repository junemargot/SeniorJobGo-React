import React from 'react';
import styles from '../styles/ResumeTemplate.module.scss';  // CSS Module 다시 사용

export const ResumeTemplate = ({ resumeData }) => {
  const { name, email, phone, education, experience, coverLetter } = resumeData;

  return (
    <div className={styles.resumeTemplate}>
      <div className={styles.header}>
        <h1>이 력 서</h1>
      </div>

      <div className={styles.personalInfo}>
        <div className={styles.infoRow}>
          <div className={styles.label}>성명</div>
          <div className={styles.value}>{name}</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.label}>연락처</div>
          <div className={styles.value}>{phone}</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.label}>이메일</div>
          <div className={styles.value}>{email}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>학력사항</h2>
        {education?.map((edu, index) => (
          <div key={index} className={styles.educationItem}>
            <div className={styles.period}>{edu.year}</div>
            <div className={styles.details}>
              <div className={styles.school}>{edu.school}</div>
              <div className={styles.major}>{edu.major} ({edu.degree})</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2>경력사항</h2>
        {experience?.map((exp, index) => (
          <div key={index} className={styles.experienceItem}>
            <div className={styles.period}>{exp.period}</div>
            <div className={styles.details}>
              <div className={styles.company}>{exp.company}</div>
              <div className={styles.position}>{exp.position}</div>
              <div className={styles.description}>{exp.description}</div>
            </div>
          </div>
        ))}
      </div>

      {coverLetter && (
        <div className={styles.section}>
          <h2>자기소개서</h2>
          <div className={styles.coverLetter}>
            {coverLetter.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 