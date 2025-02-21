import React from 'react';
import styles from '../styles/BasicInfo.module.scss';

export const ResumePreview = ({ data }) => {
  // 데이터 가공 함수들
  const hasContent = (value) => {
    if (Array.isArray(value)) return value.length > 0 && value.some(item => Object.values(item).some(v => v));
    return value && String(value).trim() !== '';
  };

  const formatExperience = (exp) => {
    if (!exp.company && !exp.position && !exp.period && !exp.description) return null;
    return {
      ...exp,
      description: exp.description
        ?.split('.')
        .filter(Boolean)
        .map(item => item.trim())
        .filter(item => item)
        .map(item => item.startsWith('•') ? item : `• ${item}`)
        .join('\n')
    };
  };

  const formatSkills = (skills) => {
    return skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill)
      .map(skill => {
        // 기본적인 스킬 설명 추가
        if (skill.includes('성실')) return `성실한 업무 태도로 맡은 일을 책임감 있게 수행`;
        if (skill.includes('체력')) return `체력적으로 건강하여 장시간 업무 수행 가능`;
        return skill;
      });
  };

  return (
    <div className={styles.previewContainer}>
      <h1 className={styles.previewTitle}>이력서</h1>
      
      {/* 기본 정보 (필수) */}
      <div className={styles.section}>
        <h2>기본 정보</h2>
        <div className={styles.infoGrid}>
          <p>성명: {data.name}</p>
          {hasContent(data.phone) && <p>연락처: {data.phone}</p>}
          {hasContent(data.email) && <p>이메일: {data.email}</p>}
        </div>
      </div>

      {/* 희망 직무 (있을 경우만) */}
      {hasContent(data.desired_job) && (
        <div className={styles.section}>
          <h2>희망 직무</h2>
          <p>{Array.isArray(data.desired_job) ? data.desired_job.join(', ') : data.desired_job}</p>
        </div>
      )}

      {/* 경력 사항 (있을 경우만) */}
      {hasContent(data.experience) && (
        <div className={styles.section}>
          <h2>경력 사항</h2>
          {data.experience
            .map(formatExperience)
            .filter(Boolean)
            .map((exp, index) => (
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
            ))}
        </div>
      )}

      {/* 학력 사항 (있을 경우만) */}
      {hasContent(data.education) && (
        <div className={styles.section}>
          <h2>학력 사항</h2>
          {data.education
            .filter(edu => edu.school || edu.major || edu.degree)
            .map((edu, index) => (
              <div key={index} className={styles.infoItem}>
                <p className={styles.year}>{edu.year}년</p>
                <p className={styles.school}>{edu.school}</p>
                {edu.major && <p className={styles.major}>{edu.major}</p>}
                {edu.degree && <p className={styles.degree}>{edu.degree}</p>}
              </div>
            ))}
        </div>
      )}

      {/* 보유 기술 (있을 경우만) */}
      {hasContent(data.skills) && (
        <div className={styles.section}>
          <h2>보유 기술 및 장점</h2>
          <div className={styles.skillsList}>
            {formatSkills(data.skills).map((skill, index) => (
              <span key={index} className={styles.skillItem}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 자기소개서 (있을 경우만) */}
      {hasContent(data.additional_info) && (
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