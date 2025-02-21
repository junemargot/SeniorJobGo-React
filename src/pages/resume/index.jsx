console.log('1. Resume 모듈 시작');

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BasicInfo } from './components/BasicInfo';
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

  // 이메일 전송 핸들러
  const handleSendEmail = async () => {
    try {
      if (!email) {
        alert('이메일 주소를 입력해주세요.');
        return;
      }

      const formData = new FormData();
      formData.append('email', email);
      formData.append('resume_data', JSON.stringify(resumeData));

      const response = await fetch(`${API_BASE_URL}/api/v1/resume/send-email`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이메일 전송에 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        alert('이력서가 성공적으로 전송되었습니다!');
        setShowEmailInput(false);
        setEmail('');
      } else {
        throw new Error(result.message || '이메일 전송에 실패했습니다.');
      }

    } catch (error) {
      console.error('이메일 전송 실패:', error);
      alert(error.message);
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
    <div style={{ padding: '2rem' }}>
      <BasicInfo 
        data={resumeData}
        onChange={setResumeData}
        mode={mode}
      />
    </div>
  );
}

console.log('5. Resume 모듈 export 전');
export default ResumePage;  // default export 사용 
console.log('6. Resume 모듈 완료'); 