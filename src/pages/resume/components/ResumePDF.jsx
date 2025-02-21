import React from 'react';
import styles from '../styles/BasicInfo.module.scss';

export const ResumePDF = ({ data }) => {
  return (
    <div className={styles.previewContainer}>
      <h1>이력서</h1>
      
      {/* 기본 정보 */}
      <div className={styles.section}>
        <h2>기본 정보</h2>
        <div className={styles.infoGrid}>
          <p>성명: {data.name}</p>
          {data.phone && <p>연락처: {data.phone}</p>}
          {data.email && <p>이메일: {data.email}</p>}
        </div>
      </div>

      {/* 희망 직무 */}
      {data.desired_job && (
        <div className={styles.section}>
          <h2>희망 직무</h2>
          <p className={styles.desired_job}>{data.desired_job}</p>
        </div>
      )}

      {/* 학력 사항 */}
      {data.education?.length > 0 && (
        <div className={styles.section}>
          <h2>학력 사항</h2>
          {data.education.map((edu, index) => (
            edu.school && (
              <div key={index} className={styles.infoItem}>
                <p className={styles.school}>{edu.school}</p>
                {edu.year && <p className={styles.year}>{edu.year}년</p>}
                {edu.major && <p className={styles.major}>{edu.major}</p>}
                {edu.degree && <p className={styles.degree}>{edu.degree}</p>}
              </div>
            )
          ))}
        </div>
      )}

      {/* 경력 사항 */}
      {data.experience?.length > 0 && (
        <div className={styles.section}>
          <h2>경력 사항</h2>
          {data.experience.map((exp, index) => (
            exp.company && (
              <div key={index} className={styles.infoItem}>
                <div className={styles.expHeader}>
                  <p className={styles.company}>{exp.company}</p>
                  {exp.period && <p className={styles.period}>{exp.period}</p>}
                </div>
                {exp.position && <p className={styles.position}>{exp.position}</p>}
                {exp.description && (
                  <div className={styles.description}>
                    {exp.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* 보유 기술 */}
      {data.skills && (
        <div className={styles.section}>
          <h2>보유 기술 및 장점</h2>
          <p className={styles.skills}>{data.skills}</p>
        </div>
      )}

      {/* 자기소개서 */}
      {data.additional_info && (
        <div className={styles.section}>
          <h2>자기소개서</h2>
          <div className={styles.coverLetter}>
            <p>{data.additional_info}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 