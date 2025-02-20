console.log('1. Resume 모듈 시작');

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ResumeForm } from './components/ResumeForm';
import { ResumeTemplate } from './components/ResumeTemplate';
import styles from './styles/Resume.module.scss';
import html2pdf from 'html2pdf.js';
import ResumeModal from '../../components/common/ResumeModal';
import axios from 'axios';

console.log('2. Resume 모듈 import 완료');

// 명시적으로 컴포넌트 이름 지정
function ResumePage() {  // function 키워드 사용
  console.log('1. ResumePage 렌더링 시작');
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') || 'create';
  const initialData = searchParams.get('data') 
    ? JSON.parse(searchParams.get('data')) 
    : null;

  const [resumeData, setResumeData] = useState(initialData || {
    name: '',
    email: '',
    phone: '',
    contact: '',
    education: [{ school: '', major: '', degree: '', year: '' }],
    experience: [{ company: '', position: '', period: '', description: '' }]
  });

  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);  // 이력서 미리보기 모달 상태 추가
  const [aiGeneratedCoverLetter, setAiGeneratedCoverLetter] = useState('');

  const generatePDF = async () => {
    const element = document.getElementById('resume-template');
    if (!element || !element.innerHTML.trim()) {
      alert('이력서 내용이 없습니다. 먼저 이력서를 생성해주세요.');
      return;
    }

    const fileName = `이력서_${resumeData.name || '미입력'}.pdf`;
    
    const opt = {
      margin: 1,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    }
  };

  const handleSendEmail = async () => {
    try {
      const pdf = await generatePDF();
      const emailSubject = `${resumeData.name}의 이력서 제출드립니다.`;
      const emailBody = `
안녕하세요.

${resumeData.name}의 이력서를 제출드립니다.
검토 부탁드립니다.

감사합니다.
      `.trim();
      
      const formData = new FormData();
      formData.append('email', email);
      formData.append('pdf', pdf);
      formData.append('subject', emailSubject);
      formData.append('body', emailBody);

      await axios.post('/api/send-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('이력서가 성공적으로 전송되었습니다!');
      setShowEmailInput(false); // 이메일 입력창 닫기
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      alert('이메일 전송에 실패했습니다.');
    }
  };

  const handleApplyCoverLetter = (coverLetter) => {
    setResumeData(prev => ({
      ...prev,
      coverLetter: coverLetter
    }));
    handleConfirmApply(); // 바로 이력서 미리보기 생성
  };

  // 이력서 미리보기 생성 함수
  const handleConfirmApply = async () => {
    try {
      // 데이터 유효성 검사
      if (!resumeData.name) {
        alert('이름을 입력해주세요.');
        return;
      }

      // 데이터 구조 확인
      const requestData = {
        resumeData: {
          name: resumeData.name || '',
          email: resumeData.email || '',
          phone: resumeData.phone || '',
          education: Array.isArray(resumeData.education) ? resumeData.education : [],
          experience: Array.isArray(resumeData.experience) ? resumeData.experience : [],
          desired_job: resumeData.desired_job || [],
          skills: resumeData.skills || '',
          additional_info: resumeData.additional_info || ''
        }
      };

      console.log("보내는 데이터:", requestData);  // 디버깅용

      const response = await axios.post(
        'http://localhost:8000/api/generate-resume',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.html) {
        // 새 창 열기 (팝업 차단 방지를 위한 설정 추가)
        const width = 800;
        const height = 800;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const previewWindow = window.open(
          '',
          '_blank',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );

        if (previewWindow) {
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>이력서 미리보기</title>
                <meta charset="UTF-8">
                <style>
                  body {
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                    font-family: Arial, sans-serif;
                  }
                  .preview-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                  }
                  .button-container {
                    text-align: center;
                    margin-top: 20px;
                    padding: 20px;
                  }
                  .action-button {
                    padding: 10px 20px;
                    background: #1a73e8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 0 10px;
                    font-size: 14px;
                  }
                  .action-button:hover {
                    background: #1557b0;
                  }
                  @media print {
                    body { background: white; }
                    .preview-container { box-shadow: none; padding: 0; }
                    .button-container { display: none; }
                  }
                </style>
              </head>
              <body>
                <div class="preview-container">
                  ${response.data.html}
                </div>
                <div class="button-container">
                  <button class="action-button" onclick="window.print()">인쇄하기</button>
                  <button class="action-button" onclick="window.print()">PDF로 저장</button>
                  <button class="action-button" onclick="window.close()">닫기</button>
                </div>
              </body>
            </html>
          `);
          previewWindow.document.close();
        } else {
          alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        }
      }
    } catch (error) {
      console.error('이력서 생성 실패:', error);
      console.error('에러 상세:', error.response?.data);
      if (error.response?.data?.detail) {
        alert(`이력서 미리보기 생성 실패: ${error.response.data.detail}`);
      } else {
        alert('이력서 미리보기 생성에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/resume/edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('서버 응답:', data);

        if (data?.resume_data) {
          setResumeData(data.resume_data);
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
      }
    };

    fetchData();
  }, []);

  console.log('6. 렌더링 직전 resumeData:', resumeData);

  console.log('ResumePage 렌더링, resumeData:', resumeData);  // 디버깅용 로그 추가

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <h1>이력서 {mode === 'edit' ? '수정' : '작성'}</h1>
        <div className={styles.formContent}>
          <ResumeForm 
            resumeData={resumeData}
            onUpdate={setResumeData}
            onApplyCoverLetter={handleApplyCoverLetter}
          />
          
          {/* PDF로 저장될 실제 이력서 템플릿 */}
          <div id="resume-template" style={{ display: 'none' }}>
            <ResumeTemplate resumeData={resumeData} />
          </div>

          <div className={styles.buttonContainer}>
            <button onClick={generatePDF} className={styles.saveButton}>
              PDF로 저장
            </button>
            <button 
              onClick={() => setShowEmailInput(!showEmailInput)} 
              className={styles.emailButton}
            >
              이메일로 보내기
            </button>
            <button onClick={() => window.close()} className={styles.cancelButton}>
              취소
            </button>
          </div>
          {showEmailInput && (
            <div className={styles.emailInputContainer}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                className={styles.emailInput}
              />
              <button 
                onClick={handleSendEmail}
                className={styles.sendButton}
              >
                보내기
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 자기소개서 미리보기 모달 */}
      {showPreview && (
        <ResumeModal onClose={() => setShowPreview(false)}>
          <div className="preview-content">
            <h2>자기소개서 미리보기</h2>
            <div className="resume-preview">
              <p>{resumeData.coverLetter}</p>
              <div className="modal-buttons">
                <button 
                  onClick={() => handleApplyCoverLetter(resumeData.coverLetter)}
                  className={styles.applyButton}
                >
                  이 내용으로 적용하기
                </button>
                <button 
                  onClick={() => setShowPreview(false)}
                  className={styles.closeButton}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </ResumeModal>
      )}
    </div>
  );
}

console.log('5. Resume 모듈 export 전');
export default ResumePage;  // default export 사용 
console.log('6. Resume 모듈 완료'); 