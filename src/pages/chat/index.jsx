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
    }, 40);
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
        });

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

  // 폼 제출 핸들러 (사용자 메시지 전송)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!userMessage.trim() || isBotResponding) return;

    // 사용자 메시지를 채팅 내역에 추가
    setChatHistory(prev => [...prev, { role: "user", text: userMessage }]);
    // 입력 필드 초기화
    setUserMessage("");
    // 포커스 설정
    setTimeout(() => promptInputRef.current?.focus(), 0);
    // scrollToBottom();
    generateResponse();
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
            <div key={index} className={`${styles.message} ${msg.role === "model" ? styles.botMessage : styles.userMessage} ${msg.loading ? "loading" : ""}`}>
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
                    {showUserInfoForm && msg.text === "채용 정보 검색을 위해 기본 정보를 입력해주세요." && (
                      <div className={styles.userForm}>
                        <form onSubmit={handleUserInfoSubmit}>
                          <button 
                            type="button" 
                            className={styles.closeButton}
                            onClick={() => setShowUserInfoForm(false)}
                          >
                            <i className='bx bx-x'></i>
                          </button>
                          <input 
                            type="number" 
                            name="age" 
                            value={userInfo.age} 
                            onChange={handleUserInfoChange} 
                            placeholder="나이 (숫자만 입력 가능)" 
                            required 
                          />
                          <input 
                            type="text" 
                            name="gender" 
                            value={userInfo.gender} 
                            onChange={handleUserInfoChange} 
                            placeholder="성별 (예: 남성)" 
                            required 
                          />
                          <input 
                            type="text" 
                            name="location" 
                            value={userInfo.location} 
                            onChange={handleUserInfoChange} 
                            placeholder="희망근무지역 (예: 서울 강남구)" 
                            required 
                          />
                          <input 
                            type="text" 
                            name="jobType" 
                            value={userInfo.jobType} 
                            onChange={handleUserInfoChange} 
                            placeholder="희망직무 (예: 사무직)" 
                            required 
                          />
                          <button type="submit">입력</button>
                        </form>
                      </div>
                    )}
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