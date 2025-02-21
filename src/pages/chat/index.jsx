// pages/chat/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/chat.module.scss';
import Header from '@components/Header/Header';
import axios from 'axios';
import IntentModal from '@pages/modal/IntentModal';
import { API_BASE_URL } from '@/config';

import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import GuideModal from '@pages/modal/GuideModal';
import JobSearchModal from '@pages/modal/JobSearchModal';
import TrainingSearchModal from '@pages/modal/TrainingSearchModal';

import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';


const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [typingIntervalId, setTypingIntervalId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);


  // 스크롤 관련 상태

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const chatsContainerRef = useRef(null);
  const promptInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);


  // 채용 정보 관련 상태
  const [selectedJob, setSelectedJob] = useState(null);
  const selectedCardRef = useRef(null);

  // 훈련정보 관련 상태
  const [selectedTraining, setSelectedTraining] = useState(null);

  // 모달 및 음성 입력 상태
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [initialMode, setInitialMode] = useState(null);

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isJobSearchModalOpen, setIsJobSearchModalOpen] = useState(false);
  const [isTrainingSearchModalOpen, setIsTrainingSearchModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // 메뉴 아이템
  const suggestions = [
    { text: "시니어JobGo 이용안내", icon: "help", id: 1 },
    { text: "AI 맞춤 채용정보 검색", icon: "work", id: 2 },
    { text: "맞춤 훈련정보 검색", icon: "school", id: 3 },
    { text: "이력서 관리", icon: "description", id: 4 },
  ];

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    const element = chatsContainerRef.current;
    if (element && !isAutoScrolling) {

      // 사용자가 스크롤하면 감지
      if (!isUserScrolling) {
        setIsUserScrolling(true);
      }
      const isScrolledUp = element.scrollTop < element.scrollHeight - element.clientHeight - 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  // 스크롤 다운
  const scrollToBottom = () => {
    if (chatsContainerRef.current) {
      setIsAutoScrolling(true);
      setIsUserScrolling(false);
      setShowScrollButton(false);

      setTimeout(() => {
        chatsContainerRef.current.scrollTo({
          top: chatsContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      setTimeout(() => {
        setIsAutoScrolling(false);
      }, 500);
    }
  };


  // 채팅 내역 변경 시 스크롤
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timer);
  }, [chatHistory]);

  // 챗봇 응답 상태 변경 시 body 클래스 업데이트
  useEffect(() => {
    if (isBotResponding) {
      document.body.classList.add('bot-responding');
    } else {
      document.body.classList.remove('bot-responding');


      // 타이핑 효과 (문장을 단어 단위로 점진적으로 채팅 상태 업데이트)
      const typingEffect = (text, updateCallback, onComplete) => {
        // 기존 인터벌 있으면 정리
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);

        }
      }
    }
  }, [isBotResponding]);


  // 폼 제출 핸들러

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || isBotResponding) return;

    const message = userMessage.trim();


    // 사용자 메시지를 채팅 내역에 추가
    setChatHistory(prev => [...prev, { role: "user", text: message }]);
    setUserMessage("");
    setIsBotResponding(true);
    setStartTime(Date.now());
    setProcessingTime(0);
    scrollToBottom();

    try {
      // 로딩 메시지 추가
      setChatHistory(prev => [...prev, {
        role: "bot",
        text: "답변을 준비중입니다...",
        loading: true
      }]);

      const response = await axios.post(`${API_BASE_URL}/chat/`, {
        user_message: message,
        session_id: "default_session"
      }, { withCredentials: true });


      // 로딩 메시지 제거 및 실제 응답 추가
      setChatHistory(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        return [...filtered, {
          role: "bot",
          text: response.data.message,
          type: response.data.type,
          jobPostings: response.data.jobPostings || [],
          trainingCourses: response.data.trainingCourses || []
        }];
      });

      const { message: botMessage, jobPostings, trainingCourses, type } = response.data;

      // 빈 봇 메시지를 먼저 추가
      const newBotMessage = {
        role: "bot",
        text: "",
        type: type,
        jobPostings: jobPostings || [],
        trainingCourses: trainingCourses || []
      };

      setChatHistory(prev => [...prev, newBotMessage]);

      // 타이핑 효과로 메시지 표시
      typingEffect(
        botMessage,
        (currentText) => {
          setChatHistory(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: currentText
            };
            return updated;
          });
        },
        () => {
          // 타이핑 완료 후 처리할 작업
          scrollToBottom();
        }
      );

      // 프로필 업데이트 (있는 경우)
      if (response.data.user_profile) {
        setUserInfo(response.data.user_profile);
      }


    } catch (error) {
      console.error("메시지 전송 오류:", error);
      setChatHistory(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        return [...filtered, {
          role: "bot",
          text: "죄송합니다. 메시지를 처리하는 중에 오류가 발생했습니다.",
          type: "error"
        }];
      });
    } finally {
      setIsBotResponding(false);
      setStartTime(null);
      scrollToBottom();
    }
  };


  // 추천 메뉴 클릭 핸들러
  const handleSuggestionClick = (item) => {
    switch (item.id) {
      case 1:
        setIsGuideModalOpen(true);
        break;
      case 2:
        setIsJobSearchModalOpen(true);
        break;
      case 3:
        setIsTrainingSearchModalOpen(true);
        break;
      // ... 다른 케이스들 (급식소 에이전트 / 정책 뉴스 / 이력서 관리 에이전트 
    }

  };

  // 채팅 내역 삭제
  const handleDeleteChats = () => {
    setChatHistory([]);
    setIsBotResponding(false);
  };

  // 채용 공고 클릭 핸들러
  const handleJobClick = (job) => {
    setSelectedJob(prev => {
      const newSelected = prev?.id === job.id ? null : job;
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
        }, 100);
      }
      return newSelected;
    });
  };

  // 응답 중단 핸들러
  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsBotResponding(false);
    setUserMessage("");
  };


  // 훈련 공고 클릭 핸들러
  const handleTrainingClick = (training) => {
    setSelectedTraining(prev => {
      const newSelected = prev?.id === training.id ? null : training;
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
        }, 100);
      }
      return newSelected;
    });

    // 채팅 기록 불러오기
    useEffect(() => {
      const fetchChatHistory = async () => {
        if (chatEndIndex.current === 0) return;

        try {
          let id = null;
          let provider = null;
          try {
            id = document.cookie.split('; ')
              .find(row => row.startsWith('sjgid='))
              .split('=')[1];

            provider = document.cookie.split('; ')
              .find(row => row.startsWith('sjgpr='))
              .split('=')[1];

            if (!await axios.get(`${API_BASE_URL}/auth/check`, {
              withCredentials: true
            })) throw new Error();
          } catch (error) {
            alert('쿠키에 로그인 정보가 부족하거나 서로 맞지 않습니다.');
            document.cookie = 'sjgid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'sjgpr=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            navigate('/');
          }

          const response = await axios.get(`${API_BASE_URL}/chat/get/limit/${id}`, {
            params: {
              end: chatEndIndex.current,
              limit: limit
            },
            withCredentials: true
          });
          // 만약 응답 데이터가 { messages: [...] } 형태라면 messages 배열을 사용합니다.
          const messages = response.data.messages ? response.data.messages : response.data;

          const newMessages = []

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
            newMessages.push(newMsg);
          }
          setChatHistory(prev => [...newMessages, ...prev]);
          chatEndIndex.current = response.data.index;
        } catch (error) {
          console.error('채팅 내역 불러오기 오류:', error);
        }
      };
      fetchChatHistory();

      // 채팅 내역 불러오기 완료 후 바로 스크롤 하단으로 이동
      setTimeout(() => {
        scrollToBottom();
      }, 100);

      // 스크롤을 맨 위로 올리면 메시지를 불러오는 로직 추가
      const container = chatsContainerRef.current;
      const handleScrollToTop = async () => {
        const scrollPosition = container.scrollTop;
        if (scrollPosition <= 0) {
          const prevScrollHeight = container.scrollHeight;
          await fetchChatHistory();
          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            const scrollDifference = newScrollHeight - prevScrollHeight;
            // 기존 스크롤 위치 보정: prepend된 메시지 높이만큼 보정
            container.scrollTop = scrollDifference;
          });
        }
      }
      container.addEventListener('scroll', handleScrollToTop);

      return () => {
        container.removeEventListener('scroll', handleScrollToTop);
      };
    }, []);

    const handleInputChange = (e) => {
      const text = e.target.value;
      if (text.length <= 500) {  // 길이 제한을 500자로 늘리고 줄바꿈 제한 제거
        setUserMessage(text);
      }

    };

    // 모달 핸들러
    const handleModalSubmit = async (response) => {
      setIsModalOpen(false);
      setUserMessage("");

      // 음성 모드 설정 업데이트
      if (response.mode === 'voice') {
        setIsVoiceMode(true);
        setInitialMode('voice');
      } else if (response.mode === 'text') {
        setIsVoiceMode(false);
        setInitialMode(null);
      }

      // 채팅 기록 업데이트
      setChatHistory(prev => {
        // 이전 로딩 메시지 제거
        const filtered = prev.filter(msg => !msg.loading);

        // 새 메시지 추가
        const newMessage = {
          role: response.role,
          text: response.text,
          loading: response.loading || false,
          mode: response.mode  // 모드 정보 유지
        };

        // 봇 메시지인 경우 추가 데이터 포함
        if (response.role === "bot" && !response.loading) {
          newMessage.jobPostings = response.jobPostings || [];
          newMessage.trainingCourses = response.trainingCourses || [];
          newMessage.type = response.type;
        }

        return [...filtered, newMessage];
      });

      // 봇 응답 상태 업데이트
      setIsBotResponding(response.loading || false);
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
      if (!isVoiceMode) {
        setInitialMode(null);
      }
    };

    const handleVoiceInputClick = () => {
      setIsModalOpen(true);
      setInitialMode('voice');
      setTimeout(() => {
        const voiceButton = document.querySelector(`.${styles.recordingIndicator}`);
        if (voiceButton) {
          voiceButton.click();
        }
      }, 100);
    };

    

    // 맞춤 검색 제출 핸들러
    const handleJobSearchSubmit = (formData) => {
      setIsJobSearchModalOpen(false);

      // 채팅 기록에 사용자 메시지 추가
      setChatHistory(prev => [...prev, {
        role: "user",
        text: "[AI맞춤채용정보]",
      }]);

      // 로딩 메시지 추가
      setChatHistory(prev => [...prev, {
        role: "bot",
        text: "맞춤 채용정보를 검색중입니다...",
        loading: true
      }]);

      // 백엔드로 데이터 전송
      const searchData = {
        ...formData,
        location: formData.city + (formData.district ? ` ${formData.district}` : ''),
      };

      axios.post(`${API_BASE_URL}/jobs/search`, searchData, {
        withCredentials: true
      })
        .then(response => {
          // 로딩 메시지 제거 및 실제 응답 추가
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.loading);
            return [...filtered, {
              role: "bot",
              text: response.data.message,
              jobPostings: response.data.jobPostings || [],
              type: "job_search"
            }];
          });
        })
        .catch(error => {
          console.error("채용정보 검색 오류:", error);
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.loading);
            return [...filtered, {
              role: "bot",
              text: "죄송합니다. 채용정보를 검색하는 중에 오류가 발생했습니다.",
              type: "error"
            }];
          });
        });
    };


    // 훈련 검색 제출 핸들러
    const handleTrainingSearchSubmit = (formData) => {
      setIsTrainingSearchModalOpen(false);

      // 채팅 기록에 사용자 메시지 추가
      setChatHistory(prev => [...prev, {
        role: "user",
        text: "[AI맞춤훈련정보]",
      }]);

      // 로딩 메시지 추가
      setChatHistory(prev => [...prev, {
        role: "bot",
        text: "맞춤 훈련정보를 검색중입니다...",
        loading: true
      }]);

      // 백엔드로 데이터 전송
      const searchData = {
        ...formData,
        location: formData.city + (formData.district ? ` ${formData.district}` : ''),
      };

      axios.post(`${API_BASE_URL}/trainings/search`, searchData, {
        withCredentials: true
      })
        .then(response => {
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.loading);
            return [...filtered, {
              role: "bot",
              text: response.data.message,
              trainingCourses: response.data.trainingCourses || [],
              type: "training_search"
            }];
          });
        })
        .catch(error => {
          console.error("훈련정보 검색 오류:", error);
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.loading);
            return [...filtered, {
              role: "bot",
              text: "죄송합니다. 훈련정보를 검색하는 중에 오류가 발생했습니다.",
              type: "error"
            }];
          });
        });

    };

    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.content}>
          <IntentModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSubmit={handleModalSubmit}
            initialMode={initialMode}
          />

          <div
            className={styles.container}
            ref={chatsContainerRef}
            onScroll={handleScroll}
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

            <div className={styles.chatsContainer}>

              {chatHistory.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  selectedJob={selectedJob}
                  selectedTraining={selectedTraining}
                  onJobClick={handleJobClick}
                  onTrainingClick={handleTrainingClick}
                  selectedCardRef={selectedCardRef}
                />
              ))}
            </div>

            <ChatInput
              userMessage={userMessage}
              isBotResponding={isBotResponding}
              isVoiceMode={isVoiceMode}
              onSubmit={handleFormSubmit}
              onChange={handleInputChange}
              onVoiceInputClick={handleVoiceInputClick}
              onStopResponse={handleStopResponse}
              onDeleteChats={handleDeleteChats}
            />

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
                      <div className={styles.messageText}>
                        {formatMessage(msg.text)}
                      </div>

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

          <GuideModal
            isOpen={isGuideModalOpen}
            onClose={() => setIsGuideModalOpen(false)}
          />

          <JobSearchModal
            isOpen={isJobSearchModalOpen}
            onClose={() => setIsJobSearchModalOpen(false)}
            onSubmit={handleJobSearchSubmit}
            userProfile={userProfile}
          />

          <TrainingSearchModal
            isOpen={isTrainingSearchModalOpen}
            onClose={() => setIsTrainingSearchModalOpen(false)}
            onSubmit={handleTrainingSearchSubmit}
            userProfile={userProfile}
          />
        </main>
      </div>
    );
  };
}
export default Chat;