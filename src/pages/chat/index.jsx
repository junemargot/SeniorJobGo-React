// pages/chat/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/chat.module.scss';
import Header from '@components/Header/Header';
import Avatar from '@assets/images/icon-robot.svg'
import { API_URL } from '../../config'; // API URL 환경변수 불러오기

// API 기본 URL 설정
const API_BASE_URL = "http://localhost:8000/api/v1";

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

  // 메뉴
  const suggestions = [
    { text: "시니어JobGo 이용안내 가이드", icon: "search" },
    { text: "AI 맞춤 채용정보 검색", icon: "work" },
    { text: "맞춤 훈련정보 검색", icon: "explore" },
    { text: "이력서 관리", icon: "description" },
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


  // 봇 응답 생성 함수  
  const generateResponse = async () => {
    setIsBotResponding(true);
    // AbortController를 생성해서 요청 중단 기능 구현
    abortControllerRef.current = new AbortController();
    // const newUserMessage = { role: "user", text: userMessage };

    setChatHistory((prev) => 
      [...prev, 
      { role: "model", text: "답변을 작성중입니다...", loading: true }
    ]);
    scrollToBottom();

    // 사용자 메시지는 이미 채팅 내역에 추가되었으므로, 600ms 딜레이 후 봇 메시지 생성
    setTimeout(async () => {
      try {
        // Gemini API 호출 시 현재 채팅 내역 + 방금 추가된 사용자 메시지를 포함
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents: [{
              parts: [{
                text: userMessage // 현재 사용자 메세지만 전송
              }]
            }]
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("죄송합니다. 응답을 받아오지 못했습니다.");
        }

        const data = await response.json();
        const responseText = data.candidates[0]?.content?.parts[0]?.text?.replace(/\*\*([^*]+)\*\*/g, "$1").trim() || "오류 발생";

        // 봇 메시지의 텍스트를 빈 문자열로 바꾸고 타이핑 효과 적용
        setChatHistory((prev) => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1] = { role: "model", text: "", loading: true };
          return updatedHistory;
        });

        // 점진적으로 텍스트 업데이트
        const cleanup = typingEffect(
          responseText,
          (partialText) => {
            setChatHistory((prev) => {
              const updatedHistory = [...prev];
              const lastIndex = updatedHistory.length - 1;
              updatedHistory[lastIndex] = {
                role: "model",
                text: partialText,
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
                text: responseText, 
                loading: false 
              };
              return updatedHistory;
            });
            setIsBotResponding(false);
          }
        );

        // cleanup 함수를 실행하기 위한 useEffect 추가 필요
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

  // 추천 문구 클릭 시 처리 (문구 입력 후 즉시 전송)
  const handleSuggestionClick = (text) => {
    setUserMessage(text);
    // 약간의 딜레이 후 폼 제출 호출 (synthetic event로 호출)
    setTimeout(() => handleFormSubmit({ preventDefault: () => {} }), 0);
  };

  // 채팅 내역 모두 삭제
  const handleDeleteChats = () => {
    setChatHistory([]);
    setIsBotResponding(false);
  };



  // 녹음 시작/중지 핸들러
  const handleRecord = async () => {
    if (!recording) {
      // 녹음 시작
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          // 녹음 종료 후 Blob 생성 등 처리 (예: 서버 전송, 다운로드 링크 생성 등)
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          console.log("녹음 완료:", audioBlob);
          audioChunksRef.current = [];
        };
        mediaRecorderRef.current.start();
        setRecording(true);
      } catch (error) {
        console.error("녹음 기능 사용 불가", error);
      }
    } else {
      // 녹음 중지
      mediaRecorderRef.current.stop();
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
            {suggestions.map((item, index) => (
              <li
                key={index}
                className={styles.suggestionsItem}
                onClick={() => handleSuggestionClick(item.text)}
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
              <p className={styles.messageText}>{msg.text}</p>
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
            <button
              id="record-btn"
              type="button"
              onClick={handleRecord}
              className={`material-symbols-rounded ${styles.recordBtn}`}
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