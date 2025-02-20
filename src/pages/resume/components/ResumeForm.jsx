import React, { useState } from 'react';
import { BasicInfo } from './BasicInfo';
import { ResumePreview } from './ResumePreview';
import styles from '../styles/ResumeForm.module.scss';
import { initialExample } from './constants';

// 입력 필드 레이블도 수정
const fieldLabels = {
  name: "성함",
  email: "이메일 (선택사항)",
  phone: "연락처",
  education: "학력 (선택사항)",
  experience: "경력사항",
  desired_job: "희망 직종",
  skills: "보유 기술 및 장점",
  additional_info: "자기소개"
};

// 입력 필드 설명도 수정
const fieldDescriptions = {
  experience: "최근 경력부터 작성해주세요. 짧은 기간이라도 좋습니다.",
  desired_job: "희망하시는 일자리를 선택해주세요 (여러 개 선택 가능)",
  skills: "성실함, 책임감 등 자신의 장점을 적어주세요",
  additional_info: "간단한 자기소개를 해주세요"
};

// 희망 직종 선택 옵션
const jobOptions = [
  "경비원",
  "미화원",
  "주차관리",
  "마트 진열",
  "식당 보조",
  "공원관리",
  "복지시설 도우미",
  "택배 분류",
  "가사도우미",
  "요양보호사",
  "기타"
];

export const ResumeForm = ({ resumeData, onUpdate, onApplyCoverLetter }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [aiGeneratedIntro, setAiGeneratedIntro] = useState('');

  const handleGenerateAI = async (data) => {
    try {
      setShowPreview(true);
      const response = await fetch('/api/v1/resume/generate-intro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      setAiGeneratedIntro(result.content);
    } catch (error) {
      console.error('AI 생성 중 오류:', error);
    }
  };

  console.log('ResumeForm 렌더링:', resumeData);  // 데이터 확인용 로그
  
  if (!resumeData) {
    return <div>데이터 로딩 중...</div>;
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.inputSection}>
        <BasicInfo 
          data={resumeData}
          onChange={onUpdate}
          onGenerateAI={() => handleGenerateAI(resumeData)}
          onApplyCoverLetter={onApplyCoverLetter}
        />
      </div>
      
      {showPreview && (
        <div className={styles.previewSection}>
          <ResumePreview 
            resumeData={resumeData}
            aiGeneratedIntro={aiGeneratedIntro}
          />
        </div>
      )}
    </div>
  );
}; 