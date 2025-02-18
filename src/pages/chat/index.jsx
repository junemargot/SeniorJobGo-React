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
    { text: "이력서 작성하기", icon: "description", id: 4 },
  ];

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    const element = chatsContainerRef.current;
    if (element && !isAutoScrolling) {
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

      chatsContainerRef.current.scrollTo({
        top: chatsContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });

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
    }
  }, [isBotResponding]);

  // 폼 제출 핸들러
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || isBotResponding) return;

    const message = userMessage.trim();
    setChatHistory(prev => [...prev, { role: "user", text: message }]);
    setUserMessage("");
    setIsBotResponding(true);
    setStartTime(Date.now());
    setProcessingTime(0);

    try {
      // 로딩 메시지 추가
      setChatHistory(prev => [...prev, {
        role: "bot",
        text: "답변을 준비중입니다...",
        loading: true
      }]);

      // 마지막 메시지가 resume_advisor 타입인지 확인
      const lastMessage = chatHistory[chatHistory.length - 1];
      const isResumeFlow = lastMessage?.type === "resume_advisor";

      // resume_advisor 플로우인 경우 다른 엔드포인트 사용
      const endpoint = isResumeFlow 
        ? `${API_BASE_URL}/resume/continue` 
        : `${API_BASE_URL}/chat/`;

      const response = await axios.post(endpoint, {
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
          suggestions: response.data.suggestions, // resume_advisor의 응답 옵션
          jobPostings: response.data.jobPostings || [],
          trainingCourses: response.data.trainingCourses || []
        }];
      });

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
      case 4:
        // 이력서 작성 시작 메시지 추가
        setChatHistory(prev => [...prev, {
          role: "user",
          text: "이력서 작성을 시작하고 싶습니다."
        }]);
        
        // 로딩 메시지 추가
        setChatHistory(prev => [...prev, {
          role: "bot",
          text: "이력서 작성을 도와드리겠습니다...",
          loading: true
        }]);

        // 이력서 작성 시작 요청
        axios.post(`${API_BASE_URL}/resume/start`, {
          session_id: "default_session"
        }, { withCredentials: true })
          .then(response => {
            setChatHistory(prev => {
              const filtered = prev.filter(msg => !msg.loading);
              return [...filtered, {
                role: "bot",
                text: response.data.message,
                type: "resume_advisor",
                suggestions: response.data.suggestions,
                html_content: response.data.html_content,
                resume_data: response.data.resume_data
              }];
            });
          })
          .catch(error => {
            console.error("이력서 작성 시작 오류:", error);
            setChatHistory(prev => {
              const filtered = prev.filter(msg => !msg.loading);
              return [...filtered, {
                role: "bot",
                text: "죄송합니다. 이력서 작성을 시작하는 중에 오류가 발생했습니다.",
                type: "error"
              }];
            });
          });
        break;
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

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setUserMessage(text);
    }
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

  // 이력서 액션 핸들러
  const handleResumeAction = async (action, resumeData) => {
    switch (action) {
      case "이력서 미리보기":
        // 새 창에서 이력서 미리보기
        const previewWindow = window.open("", "_blank");
        if (previewWindow && resumeData.html_content) {
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ko">
            <head>
              <meta charset="UTF-8">
              <title>이력서 미리보기</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
              ${resumeData.html_content}
              <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
          `);
          previewWindow.document.close();
        } else {
          alert('이력서 내용을 불러올 수 없습니다.');
        }
        break;
      
      case "이력서 다운로드":
        // 직접 다운로드 실행
        const downloadUrl = `${API_BASE_URL}/resume/download/temp`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `이력서_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      
      case "수정하기":
        try {
          const response = await axios.post(
            `${API_BASE_URL}/resume/edit`,
            { resume_id: "temp" },
            { withCredentials: true }
          );

          // 수정 모드의 이력서 표시
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.loading);
            return [...filtered, {
              role: "bot",
              type: "resume_advisor",
              text: response.data.message,
              html_content: response.data.html_content,
              suggestions: []  // 작은 버튼들 제거를 위해 빈 배열로 설정
            }];
          });

          // 이벤트 리스너 추가
          const handleMessage = (event) => {
            if (event.data === "download") {
              // PDF 다운로드 로직
              const downloadUrl = `${API_BASE_URL}/resume/download/temp`;
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `이력서_${new Date().getTime()}.pdf`;
              document.createElement('a');
              link.click();
              document.body.removeChild(link);
            } else if (event.data === "cancel") {
              // 취소 시 단순 메시지만 표시
              setChatHistory(prev => {
                const filtered = prev.filter(msg => !msg.loading);
                return [...filtered, {
                  role: "bot",
                  type: "text",  // type을 text로 설정
                  text: "이력서 작성을 취소합니다.",
                  suggestions: []  // 버튼 제거를 위해 빈 배열로 설정
                }];
              });
            }
          };

          window.addEventListener("message", handleMessage);
          return () => window.removeEventListener("message", handleMessage);

        } catch (error) {
          console.error("이력서 수정 중 오류:", error);
        }
        break;
      
      case "취소":
        // 취소 시 단순 메시지만 표시
        setChatHistory(prev => {
          const filtered = prev.filter(msg => !msg.loading);
          return [...filtered, {
            role: "bot",
            type: "text",  // type을 text로 설정
            text: "이력서 작성을 취소합니다.",
            suggestions: []  // 버튼 제거를 위해 빈 배열로 설정
          }];
        });
        break;
    }
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
              <div className={styles.appHeader}>
                <h1 className={styles.heading}>안녕하세요!</h1>
                <h2 className={styles.subHeading}>무엇을 도와드릴까요?</h2>
              </div>

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
                onResumeAction={handleResumeAction}
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

export default Chat;
