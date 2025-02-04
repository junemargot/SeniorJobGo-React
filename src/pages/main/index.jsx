// pages/main/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
// import { v4 as uuidv4 } from 'uuid';
import styles from './styles/main.module.scss';
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';
// import ChatbotIcon from '@assets/images/chatbot-icon.png';
import ChatbotIcon from '@assets/images/icon-robot.png'

const API_BASE_URL = "http://localhost:8000/api/v1";

const JobCard = ({ job }) => (
  <div className={styles.jobCard}>
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
    <p className={styles.jobCard__description}>{job.description}</p>
  </div>
);

const API_BASE_URL = "http://localhost:8000/api/v1";

const JobCard = ({ job }) => (
  <div className={styles.jobCard}>
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
    <p className={styles.jobCard__description}>{job.description}</p>
  </div>
);

const Main = () => {
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [userInfo, setUserInfo] = useState({ age: '', gender: '', location: '', jobType: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isKeywordFormExpanded, setIsKeywordFormExpanded] = useState(false);

  const chatContainerRef = useRef(null);

  const [inputText, setInputText] = useState('');
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [hideNotice, setHideNotice] = useState(false);
  const [messages, setMessages] = useState([
    // {
    //   type: 'bot',
    //   text: '안녕하세요. 시니어잡고입니다.\n본 챗봇은 상담원과의 실시간 채팅 서비스는 운영되지 않습니다'
    // },
    {
      type: 'bot',
      text: '안녕하세요. AI 취업도우미입니다.\n어떤 도움이 필요하신가요?',
      options: [
        { id: 1, text: '채용 정보' },
        { id: 2, text: '훈련 정보' },
        { id: 3, text: '이력서 관리' }
      ]
    }
  ]);

  const [sessionId, setSessionId] = useState('');

  const handleInputChange = (e) => {
    const text = e.target.value;
    if(text.length <= 200 && !text.includes('\n')) {
      setInputText(text);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const newText = inputText + pastedText;

    if(newText.length <= 200) {
      setInputText(newText);
    } else {
      setInputText(newText.slice(0, 200));
    }
  }

  const handleKeyPress = (e) => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    const trimmedText = inputText.trim();
    if (trimmedText === '' || isLoading) return;

    // 입력창 초기화를 메시지 추가 전에 수행
    setInputText('');
    setIsLoading(true);

    // 사용자의 메시지를 채팅에 추가
    const userMessage = {
      type: 'user',
      text: trimmedText,
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // 로딩 메시지 추가
    setMessages(prevMessages => [...prevMessages, {
      type: 'bot',
      text: '답변을 준비중입니다...',
      isLoading: true
    }]);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/`, {
        user_message: trimmedText,
        user_profile: userInfo,
        session_id: sessionId
      });

      const { message, jobPostings, type } = response.data;

      // 로딩 메시지 제거 후 실제 응답 추가
      setMessages(prevMessages => {
        const filtered = prevMessages.filter(msg => !msg.isLoading);
        return [...filtered, {
          type: 'bot',
          text: message,
          jobPostings: jobPostings
        }];
      });

      // 백엔드에서 업데이트된 사용자 정보 반영
      setUserInfo(userInfo);

      // 백엔드 응답에 따라 사용자 정보 입력 폼 표시
      if (jobPostings && jobPostings.length > 0) {
        setShowUserInfoForm(true);
      }

    } catch (error) {
      console.error("메시지 전송 오류:", error);
      setMessages(prevMessages => {
        const filtered = prevMessages.filter(msg => !msg.isLoading);
        return [...filtered, {
          type: 'bot',
          text: "죄송합니다. 메시지를 처리하는 중에 오류가 발생했습니다.",
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (optionId) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: 'user',
        text: `옵션 ${optionId}번을 선택했습니다.`,
      },
    ]);
    if(optionId === 1) {
      setShowUserInfoForm(true);
    }
  };

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();

    const ageValue = userInfo.age ? parseInt(userInfo.age, 10) : undefined;
    const updatedUserInfo = {
        ...userInfo,
        age: ageValue,
    };

    const userInfoText = `입력하신 정보:\n나이: ${userInfo.age}\n성별: ${userInfo.gender}\n희망근무지역: ${userInfo.location}\n희망직무: ${userInfo.jobType}\n\n이 정보를 바탕으로 채용 정보를 검색하겠습니다.`;

    setMessages(prevMessages => [
        ...prevMessages,
        { type: 'bot', text: userInfoText }
    ]);
    setShowUserInfoForm(false);

    try {
        const searchQuery = `${userInfo.jobType} ${userInfo.location}`;
        const response = await axios.post(`${API_BASE_URL}/chat/`, {
            user_message: searchQuery,
            user_profile: updatedUserInfo,
            session_id: sessionId || "default_session"
        });

        const { message, jobPostings, user_profile, type } = response.data;

        if (user_profile) {
            setUserInfo(user_profile);
        }

        setMessages(prevMessages => [
            ...prevMessages,
            {
                type: 'bot',
                text: message,
                jobPostings: jobPostings
            }
        ]);

    } catch (error) {
        console.error("일자리 검색 중 오류:", error);
        setMessages(prevMessages => [
            ...prevMessages,
            { type: 'bot', text: "죄송합니다. 일자리 검색 중 오류가 발생했습니다." }
        ]);
    }
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevInfo => ({ ...prevInfo, [name]: value }));
  };

  // 메시지가 업데이트될 때마다 최신 메시지로 스크롤 이동
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if(chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);  

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <div className={styles.chat}>
          <div className={styles.chat__header}>
            <div className={styles.chat__info}>
              <img src={ChatbotIcon} alt="챗봇 아이콘" />
              <span>시니어잡봇과 채팅하기</span>
            </div>
            <button className={styles.chat__mypage}>마이페이지</button>
          </div>

          <div className={styles.chat__messages} ref={chatContainerRef}>
            {!hideNotice && (
              <div className={styles.notice}>
                <div className={styles.notice__header} onClick={() => setIsNoticeOpen(!isNoticeOpen)}>
                  <div className={styles.notice__title}>
                    <span className={styles.notice__icon}>📢</span>
                    <span>안녕하세요. 시니어잡고입니다.</span>
                  </div>
                  <span className={`${styles.notice__arrow} ${isNoticeOpen ? styles.open : ''}`}>
                    <i className='bx bx-chevron-down'></i>
                    {/* <box-icon name='chevron-down'></box-icon> */}
                  </span>
                </div>
                {isNoticeOpen && (
                  <>
                    <div className={styles.notice__content}>
                      본 챗봇은 상담원과의 실시간 채팅 서비스는 운영되지 않습니다.
                    </div>
                    <div className={styles.notice__buttons}>
                    <button className={styles.notice__hideButton} onClick={() => setHideNotice(true)}>
                      다시 열지 않음
                    </button>
                    <button className={styles.notice__hideButton} onClick={() => setIsNoticeOpen(false)}>
                      접어두기
                    </button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={styles.message}>
                {message.type === 'bot' ? (
                  <div className={styles.message__bot}>
                    <img src={ChatbotIcon} alt="챗봇 아이콘" className={styles.message__icon} />
                    <div className={styles.message__content}>
                      {message.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < message.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                      {message.jobPostings && message.jobPostings.length > 0 && (
                        <div className={styles.jobList}>
                          {message.jobPostings.map(job => (
                            <JobCard key={job.id} job={job} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.message__user}>
                    <div className={styles.message__content}>
                      {message.text}
                    </div>
                  </div>
                )}

                {message.options && (
                  <div className={styles.options}>
                    {message.options.map((option) => (
                      <button key={option.id} className={styles.options__button} onClick={() => handleOptionClick(option.id)}>
                        <span className={styles.options__text}>{option.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.chat__input}>
            <textarea
              placeholder="메시지를 입력해주세요"
              value={inputText}
              onChange={handleInputChange}
              onKeyUp={handleKeyPress}
              onPaste={handlePaste}
              rows="1"
              disabled={isLoading}
            />
            <button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? '답변 준비중...' : '전송'}
            </button>
          </div>
        </div>

        {showUserInfoForm && (
          <div className={`${styles.userForm} ${showUserInfoForm ? styles.expanded : ''}`}>
            <div className={styles.userForm__header}>
              <span>구직 조건 입력</span>
              <button 
                className={styles.userForm__toggle}
                onClick={() => setShowUserInfoForm(false)}
              >
                접기 ▼
              </button>
            </div>
            <form onSubmit={handleUserInfoSubmit}>
              <input
                type="number"
                name="age"
                value={userInfo.age}
                onChange={handleUserInfoChange}
                placeholder="나이"
                required
              />
              <input
                type="text"
                name="location"
                value={userInfo.location}
                onChange={handleUserInfoChange}
                placeholder="희망근무지역"
                required
              />
              <input
                type="text"
                name="jobType"
                value={userInfo.jobType}
                onChange={handleUserInfoChange}
                placeholder="희망직무"
                required
              />
              <button type="submit">검색</button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Main;
