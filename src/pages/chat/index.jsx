// pages/chat/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/chat.module.scss';
import Header from '@components/Header/Header';
import Avatar from '@assets/images/icon-robot.svg'
import { API_URL } from '../../config'; // API URL 환경변수 불러오기
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = "http://localhost:8000/api/v1";

// JobCard 컴포넌트 추가
const JobCard = ({ job, onClick, isSelected, cardRef }) => (
  <div 
    ref={cardRef}
    className={`${styles.jobCard} ${isSelected ? styles.selected : ''}`} 
    onClick={() => onClick(job)}
  >
    <div className={styles.jobCard__header}>
      <div className={styles.jobCard__location}>
        <span className={styles.icon}>📍</span>
        {job.location}
      </div>
      <div className={styles.jobCard__company}>{job.company}</div>
    </div>
    <h3 className={styles.jobCard__title}>{job.title}</h3>
    <div className={styles.jobCard__details}>
      <div className={styles.jobCard__detail}>
        <span className={styles.icon}>💰</span>
        {job.salary}
      </div>
      <div className={styles.jobCard__detail}>
        <span className={styles.icon}>⏰</span>
        {job.workingHours}
      </div>
    </div>
    
    <div className={`${styles.jobCard__description} ${isSelected ? styles.visible : ''}`}>
      <p data-label="고용형태">{job.employmentType}</p>
      <p data-label="근무시간">{job.workingHours}</p>
      <p data-label="급여">{job.salary}</p>
      <p data-label="복리후생">{job.benefits}</p>
      <p data-label="상세내용">{job.description}</p>
    </div>
    
    <div className={`${styles.jobCard__footer} ${isSelected ? styles.visible : ''}`}>
      <button className={styles.jobCard__button}>
        지원하기
      </button>
    </div>
  </div>
);

// TrainingCard 컴포넌트 수정
const TrainingCard = ({ training, onClick, isSelected, cardRef }) => (
  <div 
    ref={cardRef}
    className={`${styles.trainingCard} ${isSelected ? styles.selected : ''}`} 
    onClick={() => onClick(training)}
  >
    <div className={styles.trainingCard__header}>
      <div className={styles.trainingCard__institute}>
        <span className={styles.icon}>🏫</span>
        {training.institute}
      </div>
      <div className={styles.trainingCard__location}>{training.location}</div>
    </div>
    <h3 className={styles.trainingCard__title}>{training.title}</h3>
    <div className={styles.trainingCard__details}>
      <div className={styles.trainingCard__detail}>
        <span className={styles.icon}>📅</span>
        {training.period}
      </div>
      <div className={styles.trainingCard__detail}>
        <span className={styles.icon}>💰</span>
        {training.cost}
      </div>
      <div className={styles.trainingCard__detail}>
        <span className={styles.icon}>👥</span>
        정원 {training.yardMan}명
      </div>
    </div>
    
    <div className={`${styles.trainingCard__description} ${isSelected ? styles.visible : ''}`}>
      <p data-label="훈련기관">{training.institute}</p>
      <p data-label="훈련대상">{training.target}</p>
      <p data-label="훈련기간">{training.period}</p>
      <p data-label="시작일">{training.startDate}</p>
      <p data-label="종료일">{training.endDate}</p>
      <p data-label="수강료">{training.cost}</p>
      <p data-label="정원">{training.yardMan}명</p>
      <p data-label="문의전화">{training.telNo}</p>
      <p data-label="훈련내용">{training.description}</p>
    </div>
    
    <div className={`${styles.trainingCard__footer} ${isSelected ? styles.visible : ''}`}>
      <a 
        href={training.titleLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.trainingCard__button}
      >
        상세정보 보기
      </a>
    </div>
  </div>
);

// 훈련정보 확인 대화상자
const TrainingConfirmDialog = ({ onConfirm, onCancel }) => (
  <div className={styles.confirmDialog}>
    <p>훈련정보를 알려드릴까요?</p>
    <div className={styles.confirmDialog__buttons}>
      <button onClick={onConfirm} className={styles.confirmButton}>예</button>
      <button onClick={onCancel} className={styles.cancelButton}>아니오</button>
    </div>
  </div>
);

// 채용정보 입력 폼 컴포넌트
const UserInfoForm = ({ onSubmit, onCancel }) => (
  <div className={styles.userForm}>
    <form onSubmit={onSubmit}>
      <button 
        type="button" 
        className={styles.closeButton}
        onClick={onCancel}
      >
        <i className='bx bx-x'></i>
      </button>
      <h3>맞춤 채용정보 제공을 위한 기본정보</h3>
      <input 
        type="number" 
        name="age" 
        placeholder="나이 (숫자만 입력)" 
        required 
      />
      <input 
        type="text" 
        name="gender" 
        placeholder="성별 (예: 남성)" 
        required 
      />
      <input 
        type="text" 
        name="location" 
        placeholder="희망 근무지역 (예: 서울 강남구)" 
        required 
      />
      <input 
        type="text" 
        name="jobType" 
        placeholder="희망 직종 (예: 경비)" 
        required 
      />
      <button type="submit">맞춤 채용정보 검색</button>
    </form>
  </div>
);

// 훈련정보 입력 폼 컴포넌트
const TrainingInfoForm = ({ onSubmit, onCancel, initialData }) => (
  <div className={styles.userForm}>
    <form onSubmit={onSubmit}>
      <button 
        type="button" 
        className={styles.closeButton}
        onClick={onCancel}
      >
        <i className='bx bx-x'></i>
      </button>
      <h3>맞춤 훈련정보 제공을 위한 기본정보</h3>
      <input 
        type="number" 
        name="age" 
        placeholder="나이 (숫자만 입력)" 
        defaultValue={initialData?.age || ""}
      />
      <input 
        type="text" 
        name="gender" 
        placeholder="성별 (예: 남성)" 
        defaultValue={initialData?.gender || ""}
      />
      <input 
        type="text" 
        name="education" 
        placeholder="최종학력 (예: 고졸)" 
        defaultValue={initialData?.education || ""}
      />
      <input 
        type="text" 
        name="location" 
        placeholder="거주지역 (예: 서울 강남구)" 
        defaultValue={initialData?.location || ""}
      />
      <input 
        type="text" 
        name="interests" 
        placeholder="관심분야 (예: IT, 요양, 조리)" 
        defaultValue={initialData?.interests || ""}
      />
      <button type="submit">맞춤 훈련정보 검색</button>
    </form>
  </div>
);

const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // { role: 'user' | 'model', text: string, loading?: boolean }
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [typingIntervalId, setTypingIntervalId] = useState(null); // 추가된 상태
  const chatsContainerRef = useRef(null);
  const promptInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // 녹음 관련 상태 및 ref
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 채용 정보 관련 상태 추가
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [userInfo, setUserInfo] = useState({ age: '', gender: '', location: '', jobType: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const selectedCardRef = useRef(null);

  // 훈련정보 관련 상태 추가
  const [showTrainingConfirm, setShowTrainingConfirm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showTrainingInfoForm, setShowTrainingInfoForm] = useState(false);
  const [trainingUserInfo, setTrainingUserInfo] = useState({
    age: '',
    gender: '',
    education: '',
    location: '',
    interests: ''
  });

  // 메뉴
  const suggestions = [
    { text: "시니어JobGo 이용안내", icon: "help", id: 1 },
    { text: "AI 맞춤 채용정보 검색", icon: "work", id: 2 },
    { text: "맞춤 훈련정보 검색", icon: "school", id: 3 },
    { text: "이력서 관리", icon: "description", id: 4 },
  ];

  // 채팅 컨테이너 스크롤 하단으로 이동
  const scrollToBottom = () => {
    if(chatsContainerRef.current) {
      const { current } = chatsContainerRef;

      // 애니메이션 프레임을 사용하여 DOM 업데이트 후 스크롤
      requestAnimationFrame(() => {
        current.scrollTop = current.scrollHeight;
      });
    }
  };

  // 채팅 내역 변경 시 스크롤 하단 이동
  useEffect(() => {
    // 더 안정적이니 스크롤 로직 추가
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);

    return () => clearTimeout(timer);
  }, [chatHistory]);

  // 타이핑 효과 (문장을 단어 단위로 점진적으로 채팅 상태 업데이트)
  const typingEffect = (text, updateCallback, onComplete) => {
    // 기존 인터벌 있으면 정리
    if(typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const words = text.split(" ");
    let wordIndex = 0;
    let currentText = "";
    
    const intervalId = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (currentText ? " " : "") + words[wordIndex];
        updateCallback(currentText);
        wordIndex++;
        scrollToBottom();
      } else {
        clearInterval(intervalId);
        typingIntervalRef.current = null;
        if (onComplete) onComplete();
      }
    }, 50);
    typingIntervalRef.current = intervalId;
  };


  // 봇 응답 생성 함수 수정  
  const generateResponse = async () => {
    setIsBotResponding(true);
    abortControllerRef.current = new AbortController();

    setChatHistory((prev) => 
      [...prev, 
      { role: "model", text: "답변을 작성중입니다...", loading: true }
    ]);
    scrollToBottom();

    setTimeout(async () => {
      try {
        // 백엔드 API 호출
        const response = await axios.post(`${API_BASE_URL}/chat/`, {
          user_message: userMessage,
          user_profile: userInfo,
          session_id: "default_session"
        },{ withCredentials: true });

        const { message, jobPostings, type } = response.data;

        // 봇 메시지의 텍스트를 빈 문자열로 바꾸고 타이핑 효과 적용
        setChatHistory((prev) => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1] = { role: "model", text: "", loading: true };
          return updatedHistory;
        });

        // 점진적으로 텍스트 업데이트
        const cleanup = typingEffect(
          message,
          (partialText) => {
            setChatHistory((prev) => {
              const updatedHistory = [...prev];
              const lastIndex = updatedHistory.length - 1;
              updatedHistory[lastIndex] = {
                role: "model",
                text: partialText,
                jobPostings: jobPostings,
                loading: true
              };
              return updatedHistory;
            });
          },
          () => {
            // 타이핑 효과 완료 후 loading 상태 해제
            setChatHistory((prev) => {
              const updatedHistory = [...prev];
              const lastIndex = updatedHistory.length - 1;
              updatedHistory[lastIndex] = { 
                role: "model", 
                text: message,
                jobPostings: jobPostings,
                loading: false 
              };
              return updatedHistory;
            });
            setIsBotResponding(false);
          }
        );

        return cleanup;

      } catch (error) {
        console.error(error);
        setChatHistory((prev) => [
          ...prev,
          { role: "model", text: error.message || "오류가 발생했습니다.", loading: false }
        ]);
        setIsBotResponding(false);
      }
    }, 600);
  };

  // 응답 중단 핸들러 수정
  const handleStopResponse = () => {
    if(typingIntervalId) {
      clearInterval(typingIntervalId);
      setTypingIntervalId(null);
    }

    if(abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsBotResponding(false);

    // 채팅 내역 중 loading 중인 봇 메시지는 loading 해제
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.role === "model" && msg.loading ? { ...msg, loading: false } : msg
      )
    );
  };

  // 컴포넌트 cleanup을 위한 useEffect 추가
  useEffect(() => {
    return () => {
      if(typingIntervalId) {
        clearInterval(typingIntervalId);
      }

      if(abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [typingIntervalId]);

  // 훈련 관련 키워드 체크 및 키워드 추출
  const isTrainingRelated = (message) => {
    const keywords = ['훈련', '교육', '배움', '학습', '자격증', '국비지원', '내일배움카드'];
    const found = keywords.find(keyword => message.includes(keyword));
    return found ? found : null;
  };

  // 메시지 스타일 결정
  const getMessageStyle = (msg) => {
    const baseStyle = styles.message;
    if (msg.role === "user") return `${baseStyle} ${styles.userMessage}`;
    
    // 봇 메시지 타입에 따른 스타일
    const botStyle = `${baseStyle} ${styles.botMessage}`;
    if (msg.type === "training") return `${botStyle} ${styles.trainingMessage}`;
    return botStyle;
  };

  // 훈련정보 확인 처리
  const handleTrainingConfirm = async () => {
    setShowTrainingConfirm(false);
    setShowTrainingInfoForm(true);
    setChatHistory(prev => [...prev,
      { role: "model", text: "맞춤 훈련정보 제공을 위해 기본 정보를 입력해주세요." }
    ]);
  };

  // 폼 제출 핸들러 수정
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || isBotResponding) return;

    // 사용자 메시지를 채팅 내역에 추가
    setChatHistory(prev => [...prev, { role: "user", text: userMessage }]);
    
    // 이전 메시지가 "다른 조건으로 찾아보시겠어요?"이고 훈련 관련 키워드가 있는 경우
    const prevMessage = chatHistory[chatHistory.length - 1]?.text;
    const isRetry = prevMessage === "현재 조건에 맞는 훈련과정이 없습니다. 다른 조건으로 찾아보시겠어요?";
    const trainingKeyword = isTrainingRelated(userMessage);

    if (isRetry && trainingKeyword) {
      // 기존 훈련정보에 새로운 관심분야만 업데이트
      const updatedUserInfo = {
        ...trainingUserInfo,
        interests: userMessage
      };
      setTrainingUserInfo(updatedUserInfo);

      try {
        const response = await axios.post(`${API_BASE_URL}/training/search`, {
          user_message: userMessage,
          user_profile: updatedUserInfo,
          session_id: "default_session"
        });

        const { message, trainingCourses, type } = response.data;
        
        setChatHistory(prev => [...prev, {
          role: "model",
          text: message,
          trainingCourses: trainingCourses,
          type: "training"
        }]);
      } catch (error) {
        console.error("훈련정보 검색 중 오류:", error);
        setChatHistory(prev => [...prev, {
          role: "model",
          text: "죄송합니다. 훈련정보 검색 중 오류가 발생했습니다.",
          type: "error"
        }]);
      }
    } else if (trainingKeyword) {
      // 일반적인 훈련 관련 검색
      setShowTrainingConfirm(true);
    } else {
      // 기존 채팅 처리 로직
      generateResponse();
    }

    setUserMessage("");
  };

  // 사용자 정보 입력 핸들러
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevInfo => ({ ...prevInfo, [name]: value }));
  };

  // 사용자 정보 제출 핸들러
  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    const ageValue = userInfo.age ? parseInt(userInfo.age, 10) : undefined;
    const updatedUserInfo = {
      ...userInfo,
      age: ageValue,
    };

    const userInfoText = `입력하신 정보는 다음과 같습니다.\n\n나이 : ${userInfo.age}세\n성별 : ${userInfo.gender}\n희망 근무 지역 : ${userInfo.location}\n희망 직무 : ${userInfo.jobType}\n\n🔍 이 정보를 바탕으로 채용 정보를 검색하겠습니다!`;

    setChatHistory(prev => [...prev, { role: "model", text: userInfoText }]);
    setShowUserInfoForm(false);

    try {
      const searchQuery = `${userInfo.jobType} ${userInfo.location}`;
      const response = await axios.post(`${API_BASE_URL}/chat/`, {
        user_message: searchQuery,
        user_profile: updatedUserInfo
      });

      const { message, jobPostings, user_profile } = response.data;

      if (user_profile) {
        setUserInfo(user_profile);
      }

      setChatHistory(prev => [
        ...prev,
        {
          role: "model",
          text: message,
          jobPostings: jobPostings
        }
      ]);

    } catch (error) {
      console.error("일자리 검색 중 오류:", error);
      setChatHistory(prev => [
        ...prev,
        { role: "model", text: "죄송합니다. 일자리 검색 중 오류가 발생했습니다." }
      ]);
    }
  };

  // 채용 공고 클릭 핸들러
  const handleJobClick = (job) => {
    setSelectedJob(job);
    if (selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // 추천 메뉴 클릭 핸들러 수정
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.id === 2) {  // AI 맞춤 채용정보 검색
      setShowUserInfoForm(true);
      setChatHistory(prev => [...prev, 
        { role: "user", text: "채용 정보 검색" },
        { role: "model", text: "채용 정보 검색을 위해 기본 정보를 입력해주세요." }
      ]);
    } else if (suggestion.id === 3) {  // 맞춤 훈련정보 검색
      setShowTrainingInfoForm(true);
      setChatHistory(prev => [...prev,
        { role: "user", text: "훈련 정보 검색" },
        { role: "model", text: "맞춤 훈련정보 제공을 위해 기본 정보를 입력해주세요." }
      ]);
    } else {
      setUserMessage(suggestion.text);
      setTimeout(() => handleFormSubmit({ preventDefault: () => {} }), 0);
    }
  };

  // 채팅 내역 모두 삭제
  const handleDeleteChats = () => {
    setChatHistory([]);
    setIsBotResponding(false);
  };



  // 녹음 시작/중지 핸들러
  const handleRecord = async () => {
    if (!recording) {
      try {
        // Web Speech API 초기화
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;

        // 음성 인식 결과 처리
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setUserMessage(transcript);
          setRecording(false);
        };

        // 에러 처리
        recognition.onerror = (event) => {
          console.error('음성 인식 오류:', event.error);
          setRecording(false);
          if (event.error === 'not-allowed') {
            alert('마이크 접근 권한이 필요합니다.');
          } else {
            alert('음성 인식 중 오류가 발생했습니다.');
          }
        };

        // 음성 인식 종료 처리
        recognition.onend = () => {
          setRecording(false);
        };

        // 음성 인식 시작
        recognition.start();
        setRecording(true);

      } catch (error) {
        console.error('음성 인식 초기화 오류:', error);
        alert('음성 인식을 시작할 수 없습니다.');
        setRecording(false);
      }
    } else {
      // 녹음 중지
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          SpeechRecognition.abort();
        }
      } catch (error) {
        console.error('음성 인식 중지 오류:', error);
      }
      setRecording(false);
    }
  };

  // 훈련정보 입력 폼 제출 핸들러
  const handleTrainingInfoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userInfo = {
      age: formData.get('age') || trainingUserInfo.age,
      gender: formData.get('gender') || trainingUserInfo.gender,
      education: formData.get('education') || trainingUserInfo.education,
      location: formData.get('location') || trainingUserInfo.location,
      interests: formData.get('interests') || trainingUserInfo.interests
    };
    setTrainingUserInfo(userInfo);  // 입력 데이터 저장
    setShowTrainingInfoForm(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/training/search`, {
        user_message: `${userInfo.interests || ""} 훈련과정 검색`,
        user_profile: userInfo,
        session_id: "default_session"
      });

      const { message, trainingCourses, type } = response.data;
      
      setChatHistory(prev => [...prev, {
        role: "model",
        text: message,
        trainingCourses: trainingCourses,
        type: "training"
      }]);
    } catch (error) {
      console.error("훈련정보 검색 중 오류:", error);
      setChatHistory(prev => [...prev, {
        role: "model",
        text: "죄송합니다. 훈련정보 검색 중 오류가 발생했습니다.",
        type: "error"
      }]);
    }
  };

  return (
    <>
    <Header />
      <div className={styles.container} ref={chatsContainerRef}>
        {chatHistory.length === 0 && (
          <>
          {/* 앱 헤더 */}
          <div className={styles.appHeader}>
            <h1 className={styles.heading}>안녕하세요!</h1>
            <h2 className={styles.subHeading}>무엇을 도와드릴까요?</h2>
          </div>

          {/* 추천 문구 */}
          <ul className={styles.suggestions}>
            {suggestions.map((item) => (
              <li
                key={item.id}
                className={styles.suggestionsItem}
                onClick={() => handleSuggestionClick(item)}
              >
                <p className={styles.text}>{item.text}</p>
                <span className={`material-symbols-rounded`}>{item.icon}</span>
              </li>
            ))}
          </ul>
          </>
        )}

        {/* 채팅 내역 */}
        <div className={styles.chatsContainer}>
          {chatHistory.map((msg, index) => (
            <div key={index} className={getMessageStyle(msg)}>
              {msg.role === "model" && <img src={Avatar} alt="avatar" className={styles.avatar} />}
              <div className={styles.messageContent}>
                {msg.loading ? (
                  <>
                    <div className={styles.loadingBar} />
                    <div className={styles.processingTime}>답변 생성 중...</div>
                  </>
                ) : (
                  <>
                    <p className={styles.messageText}>
                      {msg.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < msg.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                    
                    {/* 훈련정보 확인 대화상자 */}
                    {showTrainingConfirm && msg.role === "user" && isTrainingRelated(msg.text) && (
                      <TrainingConfirmDialog
                        onConfirm={handleTrainingConfirm}
                        onCancel={() => {
                          setShowTrainingConfirm(false);
                          setShowTrainingInfoForm(true);
                          setChatHistory(prev => [...prev,
                            { role: "model", text: "맞춤 훈련정보 제공을 위해 기본 정보를 입력해주세요." }
                          ]);
                        }}
                      />
                    )}
                    
                    {/* 채용정보 입력 폼 */}
                    {showUserInfoForm && msg.text === "채용 정보 검색을 위해 기본 정보를 입력해주세요." && (
                      <UserInfoForm
                        onSubmit={handleUserInfoSubmit}
                        onCancel={() => setShowUserInfoForm(false)}
                      />
                    )}
                    
                    {/* 훈련정보 입력 폼 */}
                    {showTrainingInfoForm && msg.text === "맞춤 훈련정보 제공을 위해 기본 정보를 입력해주세요." && (
                      <TrainingInfoForm
                        onSubmit={handleTrainingInfoSubmit}
                        onCancel={() => setShowTrainingInfoForm(false)}
                        initialData={trainingUserInfo}  // 저장된 데이터 전달
                      />
                    )}
                    
                    {/* 훈련과정 목록 */}
                    {msg.trainingCourses && msg.trainingCourses.length > 0 && (
                      <div className={styles.trainingList}>
                        {msg.trainingCourses.map(course => (
                          <TrainingCard
                            key={course.id}
                            training={course}
                            onClick={setSelectedTraining}
                            isSelected={selectedTraining && selectedTraining.id === course.id}
                            cardRef={selectedTraining && selectedTraining.id === course.id ? selectedCardRef : null}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* 기존 채용정보 목록 */}
                    {msg.jobPostings && msg.jobPostings.length > 0 && (
                      <div className={styles.jobList}>
                        {msg.jobPostings.map(job => (
                          <JobCard
                            key={job.id}
                            job={job}
                            onClick={handleJobClick}
                            isSelected={selectedJob && selectedJob.id === job.id}
                            cardRef={selectedJob && selectedJob.id === job.id ? selectedCardRef : null}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 프롬프트 영역 */}
        <div className={styles.promptContainer}>
          <div className={styles.promptWrapper}>
            <form id="prompt-form" onSubmit={handleFormSubmit} className={styles.promptForm}>
              <input
                ref={promptInputRef}
                type="text"
                className={styles.promptInput}
                placeholder="궁금하신 내용을 입력해주세요"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                required
                disabled={isBotResponding || recording}
              />
              <div className={styles.promptActions}>
                <button
                  id="stop-response-btn"
                  type="button"
                  onClick={handleStopResponse}
                  disabled={!isBotResponding}
                  className={`material-symbols-rounded ${styles.stopResponseBtn}`}
                >
                  stop_circle
                </button>
                <button
                  id="send-prompt-btn"
                  type="submit"
                  disabled={!userMessage.trim() || recording}
                  className={`material-symbols-rounded ${styles.sendPromptBtn}`}
                >
                  arrow_upward
                </button>
              </div>
            </form>
            <button
              id="record-btn"
              type="button"
              onClick={handleRecord}
              className={`material-symbols-rounded ${styles.recordBtn} ${recording ? styles.recording : ''}`}
              disabled={isBotResponding}
            >
              {recording ? "stop" : "mic"}
            </button>
            <button
              id="delete-chats-btn"
              type="button"
              onClick={handleDeleteChats}
              className={`material-symbols-rounded ${styles.deleteChatsBtn}`}
            >
              delete
            </button>
          </div>
          <p className={styles.disclaimerText}>
            본 챗봇은 상담원과의 실시간 채팅 서비스는 운영되지 않습니다.<br />
            AI채용도우미와 자유롭게 대화하며 나에게 맞는 채용 정보를 받아보세요!
          </p>
        </div>
      </div>
    </>
  );
};

export default Chat;