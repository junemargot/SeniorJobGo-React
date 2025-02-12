// pages/chat/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/chat.module.scss';
import Header from '@components/Header/Header';
import Avatar from '@assets/images/icon-robot.svg'
import axios from 'axios';
import IntentModal from '@pages/modal/IntentModal';
import { API_BASE_URL } from '@/config';

// API 기본 URL 설정
// const API_BASE_URL = "http://localhost:8000/api/v1";

// JobCard 컴포넌트 추가
const JobCard = ({ job, onClick, isSelected, cardRef }) => (
  <div 
    ref={cardRef}
    className={`${styles.jobCard} ${isSelected ? styles.selected : ''}`} 
    onClick={() => onClick(job)}
    data-job-id={job.id}
  >
    <div className={styles.jobCard__header}>
      <div className={styles.jobCard__location}>
        {/* <span className={styles.icon}>📍</span> */}
        <span className={`material-symbols-rounded`}>location_on</span>
        {job.location}
      </div>
      <div className={styles.jobCard__company}>{job.company}</div>
    </div>
    <h3 className={styles.jobCard__title}>{job.title}</h3>
    <div className={styles.jobCard__details}>
      <div className={styles.jobCard__detail}>
        {/* <span className={styles.icon}>💰</span> */}
        <span className={`material-symbols-rounded`}>money_bag</span>
        {job.salary}
      </div>
      <div className={styles.jobCard__detail}>
        {/* <span className={styles.icon}>⏰</span> */}
        <span className={`material-symbols-rounded`}>calendar_month</span>
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
    data-training-id={training.id}
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

// getMessageStyle 함수 수정
const getMessageStyle = (msg) => {
  const baseStyle = styles.message;
  if (msg.role === "model" || msg.role === "bot") {
    return `${baseStyle} ${styles.botMessage} ${msg.loading ? styles.loading : ""}`;
  }
  return `${baseStyle} ${styles.userMessage}`;
};

const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [typingIntervalId, setTypingIntervalId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  
  // 스크롤 관련 상태 추가
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  
  const chatsContainerRef = useRef(null);
  const promptInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);

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

  // 대화 모드 관리를 위한 상태 개선
  const [chatContext, setChatContext] = useState({
    mode: 'general', // 'general' | 'job' | 'training'
    lastQuery: '',
    userProfile: null,
    searchHistory: [],
    formSubmitted: false // 폼 제출 여부 추가
  });

  // 메뉴
  const suggestions = [
    { text: "시니어JobGo 이용안내", icon: "help", id: 1 },
    { text: "AI 맞춤 채용정보 검색", icon: "work", id: 2 },
    { text: "맞춤 훈련정보 검색", icon: "school", id: 3 },
    { text: "이력서 관리", icon: "description", id: 4 },
  ];

  // 스크롤 이벤트 핸들러 추가
  const handleScroll = () => {
    const element = chatsContainerRef.current;
    if (element && !isAutoScrolling) {
      // 사용자가 스크롤하면 감지
      if(!isUserScrolling) {
        setIsUserScrolling(true);
      }

      // 스크롤이 위로 올라갔을 때 버튼 표시
      const isScrolledUp = element.scrollTop < element.scrollHeight - element.clientHeight - 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  // 스크롤 다운 함수 수정
  const scrollToBottom = () => {
    if(chatsContainerRef.current) {
      setIsAutoScrolling(true);
      setIsUserScrolling(false);
      setShowScrollButton(false);

      chatsContainerRef.current.scrollTo({
        top: chatsContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });

      // 스크롤 애니메이션 완료 후 auto scrolling 상태 해제
      setTimeout(() => {
        setIsAutoScrolling(false);
      }, 500);
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

  // 폼 제출 핸들러 수정
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || isBotResponding) return;

    const message = userMessage.trim();
    
    // 사용자 메시지를 채팅 내역에 추가
    setChatHistory(prev => [...prev, { role: "user", text: message }]);
    setIsBotResponding(true);
    setStartTime(Date.now());
    setProcessingTime(0);

    try {
      // 백엔드로 메시지 전송
      const response = await axios.post(`${API_BASE_URL}/chat/`, {
        user_message: message,
        user_profile: userInfo,
        session_id: "default_session"
      }, { withCredentials: true });

      const { message: botMessage, jobPostings, trainingCourses, type } = response.data;
      console.log('Response data:', response.data);  // 응답 데이터 로깅

      // 봇 응답 추가
      const newBotMessage = {
        role: "bot",
        text: botMessage,
        type: type,
        jobPostings: jobPostings || [],
        trainingCourses: trainingCourses || []
      };

      setChatHistory(prev => [...prev, newBotMessage]);

      // 프로필 업데이트 (있는 경우)
      if (response.data.user_profile) {
        setUserInfo(response.data.user_profile);
      }

    } catch (error) {
      console.error("메시지 전송 오류:", error);
      setChatHistory(prev => [...prev, {
        role: "model",
        text: "죄송합니다. 메시지를 처리하는 중에 오류가 발생했습니다.",
        type: "error"
      }]);
    } finally {
      setIsBotResponding(false);
      setUserMessage("");
      setStartTime(null);
    }
  };

  // 추천 메뉴 클릭 핸들러 수정
  const handleSuggestionClick = (suggestion) => {
    setUserMessage(suggestion.text);
    setTimeout(() => handleFormSubmit({ preventDefault: () => {} }), 0);
  };

  // 사용자 정보 제출 핸들러 수정
  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedUserInfo = {
      age: formData.get('age'),
      gender: formData.get('gender'),
      location: formData.get('location'),
      jobType: formData.get('jobType')
    };

    setUserInfo(updatedUserInfo);
    setShowUserInfoForm(false);

    // 사용자 정보와 함께 검색 요청
    const message = `${updatedUserInfo.location}에서 ${updatedUserInfo.jobType} 일자리 찾기`;
    setUserMessage(message);
    setTimeout(() => handleFormSubmit({ preventDefault: () => {} }), 0);
  };

  // 훈련정보 입력 폼 제출 핸들러 수정
  const handleTrainingInfoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedUserInfo = {
      age: formData.get('age'),
      gender: formData.get('gender'),
      education: formData.get('education'),
      location: formData.get('location'),
      interests: formData.get('interests')
    };

    setTrainingUserInfo(updatedUserInfo);
    setShowTrainingInfoForm(false);

    // 사용자 정보와 함께 검색 요청
    const message = `${updatedUserInfo.location}에서 ${updatedUserInfo.interests} 관련 교육 찾기`;
    setUserMessage(message);
    setTimeout(() => handleFormSubmit({ preventDefault: () => {} }), 0);
  };

  // 채팅 내역 모두 삭제
  const handleDeleteChats = () => {
    setChatHistory([]);
    setIsBotResponding(false);
  };

  // 채용 공고 클릭 핸들러 추가
  const handleJobClick = (job) => {
    setSelectedJob(prev => {
      const newSelected = prev?.id === job.id ? null : job;
      // 새로 선택된 카드가 있을 때만 스크롤
      if (newSelected) {
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-job-id="${job.id}"]`);
          if (cardElement) {
            cardElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
          }
        }, 100); // 약간의 지연을 주어 상태 업데이트와 DOM 업데이트가 완료된 후 스크롤
      }
      return newSelected;
    });
  };

  // 응답 중단 핸들러 추가
  const handleStopResponse = () => {
    if(abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsBotResponding(false);
    setUserMessage("");
  };

  // 채팅 내역 전부 불러오기
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const id = document.cookie.split('; ')
          .find(row => row.startsWith('sjgid='))
          .split('=')[1];
        const response = await axios.get(`${API_BASE_URL}/chat/get/all/${id}`, { withCredentials: true });
        // 만약 응답 데이터가 { messages: [...] } 형태라면 messages 배열을 사용합니다.
        const messages = response.data.messages ? response.data.messages : response.data;
        // for문을 통해 index가 0인 메시지는 건너뛰고, 나머지 메시지를 변환하여 chatHistory에 추가합니다.
        for (const msg of messages) {
          const role = msg.role === "user" ? "user" : "model";
          let newMsg = { role, text: "" };
         
          // 문자열인 경우
          if (typeof msg.content === "string") {
            newMsg.text = msg.content;
          } 
          // 객체인 경우
          else if (typeof msg.content === "object" && msg.content !== null) {
            // 메시지 텍스트 설정
            if (msg.content.message) {
              newMsg.text = msg.content.message;
            } else if (msg.content.text) {
              newMsg.text = msg.content.text;
            }
            
            // 채용정보 추가
            if (msg.content.jobPostings && msg.content.jobPostings.length > 0) {
              newMsg.jobPostings = msg.content.jobPostings;
            }
            
            // 훈련과정 정보 추가
            if (msg.content.trainingCourses && msg.content.trainingCourses.length > 0) {
              newMsg.trainingCourses = msg.content.trainingCourses;
            }

            // 메시지 타입 추가
            if (msg.content.type) {
              newMsg.type = msg.content.type;
            }

            // 음성 입력 모드 추가
            if (msg.content.mode === 'voice') {
              setIsVoiceMode(true);
            }
          }
          
          // 채팅 내역에 추가
          setChatHistory(prev => [...prev, newMsg]);
        }
      } catch (error) {
        console.error('채팅 내역 불러오기 오류:', error);
      }
    };
    fetchChatHistory();
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    if(text.length <= 500) {  // 길이 제한을 500자로 늘리고 줄바꿈 제한 제거
      setUserMessage(text);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(true);  // 모달 상태 추가
  const [isVoiceMode, setIsVoiceMode] = useState(false);  // 음성 입력 모드 상태 추가
  const [initialMode, setInitialMode] = useState(null);  // 음성 입력 모드 초기 설정 상태 추가

  // handleModalSubmit 수정
  const handleModalSubmit = async (response) => {
    setIsModalOpen(false);
    setUserMessage("");

    // 음성 입력 모드 설정
    if (response.mode === 'voice') {
      setIsVoiceMode(true);
      setInitialMode('voice');
    }

    // 음성 입력 모드가 아닌 경우에만 사용자 입력을 채팅 기록에 추가
    if (!response.mode || response.mode !== 'voice') {
      const userMessage = {
        role: "user",
        text: response.originalText || "음성으로 검색하기",
      };
      setChatHistory((prev) => [...prev, userMessage]);
    }

    // 봇 응답 처리
    setIsBotResponding(true);
    try {
      const botMessage = {
        role: "model",
        text: response.message || response.text,
      };

      if (response.jobPostings && response.jobPostings.length > 0) {
        botMessage.jobPostings = response.jobPostings;
      }

      if (response.trainingCourses && response.trainingCourses.length > 0) {
        botMessage.trainingCourses = response.trainingCourses;
      }

      if (response.type) {
        botMessage.type = response.type;
      }

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error processing bot response:", error);
    } finally {
      setIsBotResponding(false);
    }
  };

  // 음성 입력 모달 열기 핸들러 수정
  const handleVoiceInputClick = () => {
    setIsModalOpen(true);
    setInitialMode('voice');
    // 음성 녹음 모드로 바로 시작하도록 수정
    setTimeout(() => {
      const voiceButton = document.querySelector(`.${styles.recordingIndicator}`);
      if (voiceButton) {
        voiceButton.click();
      }
    }, 100);
  };

  // 모달 닫기 핸들러 수정
  const handleModalClose = () => {
    setIsModalOpen(false);
    // 음성 모드가 아닐 때만 isVoiceMode를 false로 설정
    if (!isVoiceMode) {
      setInitialMode(null);
    }
  };

  // 훈련 공고 클릭 핸들러 추가
  const handleTrainingClick = (training) => {
    setSelectedTraining(prev => {
      const newSelected = prev?.id === training.id ? null : training;
      // 새로 선택된 카드가 있을 때만 스크롤
      if (newSelected) {
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-training-id="${training.id}"]`);
          if (cardElement) {
            cardElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
          }
        }, 100); // 약간의 지연을 주어 상태 업데이트와 DOM 업데이트가 완료된 후 스크롤
      }
      return newSelected;
    });
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        {/* IntentModal 추가 */}
        <IntentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          initialMode={initialMode}
        />
        
        <div 
          className={styles.container} 
          ref={chatsContainerRef}
          onScroll={handleScroll}  // 스크롤 이벤트 핸들러 추가
        >
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
                {(msg.role === "model" || msg.role === "bot") && <img src={Avatar} alt="avatar" className={styles.avatar} />}
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
                      
                      {/* 채용정보 목록 */}
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
                      
                      {/* 훈련과정 목록 */}
                      {msg.trainingCourses && msg.trainingCourses.length > 0 && (
                        <div className={styles.trainingList}>
                          {msg.trainingCourses.map(course => (
                            <TrainingCard
                              key={course.id}
                              training={{
                                ...course,
                                yardMan: course.yardMan || '미정'
                              }}
                              onClick={handleTrainingClick}
                              isSelected={selectedTraining && selectedTraining.id === course.id}
                              cardRef={selectedTraining && selectedTraining.id === course.id ? selectedCardRef : null}
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
              {isVoiceMode ? (
                <button
                  className={`${styles.voiceInputButton}`}
                  onClick={handleVoiceInputClick}
                  disabled={isBotResponding}
                >
                  <span className="material-symbols-rounded">mic</span>
                  
                </button>
              ) : (
                <form id="prompt-form" onSubmit={handleFormSubmit} className={styles.promptForm}>
                  <input
                    ref={promptInputRef}
                    type="text"
                    className={styles.promptInput}
                    placeholder="궁금하신 내용을 입력해주세요"
                    value={userMessage}
                    onChange={handleInputChange}
                    required
                    disabled={isBotResponding}
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
                      disabled={!userMessage.trim()}
                      className={`material-symbols-rounded ${styles.sendPromptBtn}`}
                    >
                      arrow_upward
                    </button>
                  </div>
                </form>
              )}
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

          {/* 최근 메시지로 이동 버튼 추가 */}
          {showScrollButton && (
            <button 
              className={`${styles.scrollButton} ${styles.visible}`} 
              onClick={scrollToBottom}
            >
              <span className="material-symbols-rounded">arrow_downward</span>
              최근 메시지 보기
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;