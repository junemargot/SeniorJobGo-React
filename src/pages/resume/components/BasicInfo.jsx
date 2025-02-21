import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import styles from '../styles/BasicInfo.module.scss';
import { 
  initialExample, 
  fieldLabels, 
  fieldDescriptions, 
  jobOptions 
} from './constants';
import { API_BASE_URL } from '@/config';
import { ResumePreview } from './ResumePreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generatePDF } from '../../../utils/pdfGenerator';
import { EmailModal } from './EmailModal';

export const BasicInfo = ({ data, onChange }) => {
  const [aiGeneratedIntro, setAiGeneratedIntro] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formattedHtml, setFormattedHtml] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const initialData = {
    name: "",
    age: null,
    email: "",
    phone: "",
    // ... 나머지 초기값들
  } || data || initialExample;

  // 입력 처리 함수들
  const handleInputChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

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

  // AI 자기소개서 생성
  const generateAIIntro = async () => {
    try {
      setIsGenerating(true);
      
      // 필수 데이터 확인
      if (!data.name) {
        throw new Error('이름을 입력해주세요.');
      }

      const cleanData = {
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        education: Array.isArray(data.education) 
          ? data.education.filter(edu => edu && typeof edu === 'object' && (edu.school || edu.major || edu.degree))
          : [],
        experience: Array.isArray(data.experience)
          ? data.experience.filter(exp => exp && typeof exp === 'object' && (exp.company || exp.position || exp.description))
          : [],
        desired_job: Array.isArray(data.desired_job) 
          ? data.desired_job.filter(Boolean).join(', ')
          : (typeof data.desired_job === 'string' ? data.desired_job : ''),
        skills: typeof data.skills === 'string' ? data.skills : '',
        additional_info: typeof data.additional_info === 'string' ? data.additional_info : ''
      };

      const response = await fetch('http://localhost:8000/api/v1/resume/generate-intro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('서버 응답:', result);

      // 응답 구조 처리 수정
      if (result?.content?.data?.content) {
        setAiGeneratedIntro(result.content.data.content);
        
        // filtered_data는 현재 응답에 없으므로 생략
        // 필요한 경우 서버 응답 구조를 수정해야 함
      } else {
        throw new Error('자기소개서 생성에 실패했습니다');
      }

    } catch (error) {
      console.error('자기소개서 생성 중 오류:', error);
      alert(error.message || '자기소개서 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 미리보기 HTML 가져오기
  const getFormattedResume = async () => {
    try {
      // ResumeData 모델과 정확히 일치하는 형식으로 데이터 구성
      const resumeData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        desired_job: Array.isArray(data.desired_job) ? data.desired_job.join(", ") : (data.desired_job || ""),
        skills: data.skills || "",
        additional_info: data.additional_info || "",
        age: data.age ? parseInt(data.age) : null
      };

      console.log('Sending data:', resumeData); // 데이터 확인용 로그

      const response = await fetch(`${API_BASE_URL}/api/v1/resume/format`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Response status:', response.status);
        console.error('Error details:', errorData);
        throw new Error(`이력서 포맷팅 실패: ${errorData.detail || '알 수 없는 오류'}`);
      }
      
      const result = await response.json();
      setFormattedHtml(result.html);
    } catch (error) {
      console.error('이력서 포맷팅 중 오류:', error);
      alert(error.message);
    }
  };

  // 미리보기 토글
  const togglePreview = async () => {
    if (!showPreview) {
      await getFormattedResume();
    }
    setShowPreview(!showPreview);
  };

  // PDF 생성만 하는 함수
  const generatePDF = async () => {
    try {
      if (!showPreview) {
        setShowPreview(true);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const element = document.getElementById('resume-preview');
      
      // PDF 생성 전 스타일 복사
      const styles = document.createElement('style');
      styles.textContent = `
        .resume {
          font-family: 'Noto Sans KR', sans-serif;
          padding: 20px;
        }
        .resume h1 { font-size: 28px; text-align: center; margin-bottom: 40px; color: #333; }
        .resume section { margin-bottom: 35px; }
        .resume h2 { 
          font-size: 22px; 
          color: #333;
          padding-bottom: 12px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        .resume .content { font-size: 16px; line-height: 1.8; color: #444; }
        .resume .basic-info p { margin-bottom: 12px; font-size: 16px; }
      `;
      element.appendChild(styles);

      const opt = {
        margin: [20, 20, 20, 20],
        filename: `${data.name ? data.name + '_' : ''}이력서.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all', before: '.page-break', avoid: ['section', '.content', 'p'] }
      };

      // PDF를 Blob으로 생성
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      
      // 스타일 제거
      element.removeChild(styles);
      
      return pdfBlob;
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      throw error;
    }
  };

  // 이메일 전송 함수 수정
  const handleEmailSend = async (email) => {
    try {
      // PDF Blob 생성
      const pdfBlob = await generatePDF();
      
      // PDF를 base64로 변환
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      // 이메일 전송 요청
      const response = await fetch(`${API_BASE_URL}/api/v1/resume/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: data.name || '지원자',
          pdf_content: base64data
        })
      });

      if (!response.ok) {
        throw new Error('이메일 전송에 실패했습니다.');
      }

      alert('이메일이 성공적으로 전송되었습니다.');
      setShowEmailModal(false);
    } catch (error) {
      console.error('이메일 전송 중 오류:', error);
      alert('이메일 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 다운로드 함수
  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generatePDF();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${data.name ? data.name + '_' : ''}이력서.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('PDF 다운로드 중 오류:', error);
      alert('PDF 다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        {/* 기본 정보 입력 폼 */}
        <div className={styles.basicInfo} id="resume-form">
          <div className={styles.section}>
            <h2>기본 정보</h2>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label>성명</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="성명을 입력하세요"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <label>나이</label>
                <div className={styles.inputWithHint}>
                  <input
                    type="number"
                    value={data.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder=""
                    min="55"
                    max="100"
                    className={styles.input}
                  />
                  <span className={styles.hint}>(55세 이상 입력 가능합니다.)</span>
                </div>
              </div>
              <div className={styles.formField}>
                <label>연락처</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="연락처를 입력하세요"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <label>이메일</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* 학력 섹션 */}
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

          {/* 경력 섹션 */}
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

          {/* 희망 직종 섹션 */}
          <div className={styles.section}>
            <h3>{fieldLabels.desired_job}</h3>
            <p className={styles.description}>{fieldDescriptions.desired_job}</p>
            <select 
              multiple 
              className={styles.jobSelect}
              value={data.desired_job || []}
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

          {/* 보유 기술 섹션 */}
          <div className={styles.section}>
            <h3>{fieldLabels.skills}</h3>
            <p className={styles.description}>{fieldDescriptions.skills}</p>
            <textarea
              value={data.skills || ''}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="예: 성실함, 책임감, 기본적인 스마트폰 사용 가능"
              className={styles.textarea}
            />
          </div>

          {/* 자기소개서 섹션 */}
          <div className={styles.section}>
            <h3>자기소개서</h3>
            <p className={styles.description}>자신을 소개하는 글을 작성해주세요.</p>
            
            <div className={styles.introContainer}>
              <textarea
                value={data.additional_info || ''}
                onChange={(e) => handleInputChange('additional_info', e.target.value)}
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
                      // AI 생성 자기소개서를 그대로 적용
                      const updatedData = {
                        ...data,
                        additional_info: aiGeneratedIntro
                      };
                      
                      // 상태 업데이트
                      onChange(updatedData);
                      
                      // 성공 메시지
                      alert('자기소개서가 적용되었습니다.');
                    }}
                    className={styles.applyButton}
                  >
                    이 내용으로 적용하기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className={styles.actionButtons}>
            <button 
              onClick={togglePreview}
              className={styles.previewButton}
            >
              {showPreview ? '미리보기 닫기' : '미리보기'}
            </button>
            <button 
              onClick={handleDownloadPDF}
              className={styles.downloadButton}
            >
              PDF 다운로드
            </button>
            <button 
              onClick={() => setShowEmailModal(true)}
              className={styles.emailButton}
            >
              이메일로 전송
            </button>
          </div>
        </div>
      </div>

      {/* 미리보기 섹션 */}
      {showPreview && (
        <div className={styles.previewContainer}>
          <div 
            id="resume-preview" 
            className={styles.previewContent}
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />
        </div>
      )}

      {showEmailModal && (
        <EmailModal
          onClose={() => setShowEmailModal(false)}
          onSubmit={handleEmailSend}
          name={data.name}
        />
      )}
    </div>
  );
}; 