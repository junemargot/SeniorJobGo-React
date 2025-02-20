import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import styles from '../styles/BasicInfo.module.scss';
import { 
  initialExample, 
  fieldLabels, 
  fieldDescriptions, 
  jobOptions 
} from './constants';  // 새로운 파일로 상수들 분리
import { API_BASE_URL } from '@/config';

export const BasicInfo = ({ 
  data, 
  onChange, 
  onApplyCoverLetter = () => {} // 기본값 설정
}) => {
  // 초기 데이터가 없을 경우 예시 데이터 사용
  const initialData = data || initialExample;

  const [aiGeneratedIntro, setAiGeneratedIntro] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // 학력 추가/삭제 핸들러
  const handleEducationChange = (index, field, value) => {
    const newEducation = [...(data.education || [])];
    if (!newEducation[index]) {
      newEducation[index] = {};
    }
    newEducation[index] = { ...newEducation[index], [field]: value };
    handleInputChange('education', newEducation);
  };

  const addEducation = () => {
    const newEducation = [...(data.education || [])];
    newEducation.push({ school: '', major: '', degree: '', year: '' });
    handleInputChange('education', newEducation);
  };

  const removeEducation = (index) => {
    const newEducation = data.education.filter((_, i) => i !== index);
    handleInputChange('education', newEducation);
  };

  // 경력 추가/삭제 핸들러
  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...(data.experience || [])];
    if (!newExperience[index]) {
      newExperience[index] = {};
    }
    newExperience[index] = { ...newExperience[index], [field]: value };
    handleInputChange('experience', newExperience);
  };

  const addExperience = () => {
    const newExperience = [...(data.experience || [])];
    newExperience.push({ company: '', position: '', period: '', description: '' });
    handleInputChange('experience', newExperience);
  };

  const removeExperience = (index) => {
    const newExperience = data.experience.filter((_, i) => i !== index);
    handleInputChange('experience', newExperience);
  };

  const generateAIIntro = async () => {
    try {
      setIsGenerating(true);
      
      // 데이터 유효성 검사
      const requestData = {
        name: data.name || '',
        experience: Array.isArray(data.experience) ? data.experience : [],
        skills: data.skills || '',
        desired_job: Array.isArray(data.desired_job) ? data.desired_job : []
      };

      console.log('요청 데이터:', requestData); // 디버깅용

      const response = await fetch(`${API_BASE_URL}/resume/generate-intro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API 요청 실패');
      }

      const result = await response.json();
      
      // 텍스트를 한 글자씩 표시
      let currentText = '';
      const content = result.content;
      
      for (let i = 0; i < content.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        currentText += content[i];
        setAiGeneratedIntro(currentText);
      }

    } catch (error) {
      console.error('자기소개서 생성 중 오류:', error);
      alert('자기소개서 생성에 실패했습니다: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF 다운로드 함수
  const handleDownloadPDF = (e) => {
    e.preventDefault(); // 기본 동작 방지
    
    const element = document.getElementById('resume-content');
    const opt = {
      margin: 1,
      filename: '이력서.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!data) {
    console.warn('BasicInfo: data가 undefined입니다');
    return <div>데이터 로딩 중...</div>;
  }

  // data가 있을 때만 렌더링
  return (
    <div className={styles.basicInfo} id="resume-content">
      <div className={styles.section}>
        <h3>{fieldLabels.name}</h3>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="예: 김순자"
          className={styles.input}
        />
      </div>

      <div className={styles.section}>
        <h3>{fieldLabels.phone}</h3>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="예: 010-1234-5678"
          className={styles.input}
        />
      </div>

      <div className={styles.section}>
        <h3>{fieldLabels.email}</h3>
        <input
          type="email"
          value={data.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="선택사항입니다"
          className={styles.input}
        />
      </div>

      <div className={styles.section}>
        <h3>{fieldLabels.education}</h3>
        <p className={styles.description}>선택사항입니다. 작성을 원하시는 경우에만 입력해주세요.</p>
        {(data.education || []).map((edu, index) => (
          <div key={index} className={styles.educationItem}>
            <input
              type="text"
              value={edu.school || ''}
              onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
              placeholder="학교명"
              className={styles.input}
            />
            <input
              type="text"
              value={edu.year || ''}
              onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
              placeholder="졸업연도"
              className={styles.input}
            />
            <button 
              type="button" 
              onClick={() => removeEducation(index)}
              className={styles.button}
            >
              삭제
            </button>
          </div>
        ))}
        <button 
          type="button" 
          onClick={addEducation}
          className={styles.button}
        >
          학력 추가
        </button>
      </div>

      <div className={styles.section}>
        <h3>{fieldLabels.experience}</h3>
        <p className={styles.description}>{fieldDescriptions.experience}</p>
        {(data.experience || []).map((exp, index) => (
          <div key={index} className={styles.experienceItem}>
            <input
              type="text"
              value={exp.company || ''}
              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
              placeholder="회사/기관명"
              className={styles.input}
            />
            <input
              type="text"
              value={exp.position || ''}
              onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
              placeholder="직위"
              className={styles.input}
            />
            <input
              type="text"
              value={exp.period || ''}
              onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
              placeholder="근무기간 (예: 2015-2020)"
              className={styles.input}
            />
            <textarea
              value={exp.description || ''}
              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
              placeholder="주요 업무"
              className={styles.textarea}
            />
            <button 
              type="button" 
              onClick={() => removeExperience(index)}
              className={styles.button}
            >
              삭제
            </button>
          </div>
        ))}
        <button 
          type="button" 
          onClick={addExperience}
          className={styles.button}
        >
          경력 추가
        </button>
      </div>

      <div className={styles.section}>
        <h3>{fieldLabels.desired_job}</h3>
        <p className={styles.description}>{fieldDescriptions.desired_job}</p>
        <select 
          multiple 
          className={styles.jobSelect}
          value={initialData.desired_job}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            handleInputChange('desired_job', selectedOptions);
          }}
        >
          {jobOptions.map(job => (
            <option key={job} value={job}>{job}</option>
          ))}
        </select>
        <p className={styles.hint}>* Ctrl(⌘) 키를 누른 채로 클릭하면 여러 개를 선택할 수 있습니다.</p>
      </div>

      <div className={styles.section}>
        <h3>{fieldLabels.skills}</h3>
        <p className={styles.description}>{fieldDescriptions.skills}</p>
        <textarea
          value={data.skills}
          onChange={(e) => handleInputChange('skills', e.target.value)}
          placeholder="예: 성실함, 책임감, 기본적인 스마트폰 사용 가능"
          className={styles.textarea}
        />
      </div>

      <div className={styles.section}>
        <h3>자기소개서</h3>
        <p className={styles.description}>자신을 소개하는 글을 작성해주세요.</p>
        
        <div className={styles.introContainer}>
          <textarea
            value={data.additional_info || ''}
            onChange={(e) => onChange({ ...data, additional_info: e.target.value })}
            placeholder="예: 건강하고 성실하게 일하겠습니다."
            className={styles.textarea}
          />
          
          <button 
            onClick={generateAIIntro}
            disabled={isGenerating}
            className={styles.aiButton}
          >
            {isGenerating ? 'AI가 작성 중...' : 'AI 자기소개서 생성'}
          </button>

          {aiGeneratedIntro && (
            <div className={styles.aiIntroSection}>
              <h4>AI 추천 자기소개서</h4>
              <div className={styles.aiIntroContent}>
                {aiGeneratedIntro}
              </div>
              <button 
                onClick={() => {
                  onChange({ ...data, additional_info: aiGeneratedIntro });
                  onApplyCoverLetter(aiGeneratedIntro);
                }}
                className={styles.applyButton}
              >
                이 내용으로 적용하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 