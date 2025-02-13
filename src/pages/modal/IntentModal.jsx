import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/IntentModal.module.scss';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

const IntentModal = ({ isOpen, onClose, onSubmit, initialMode }) => {
  const [mode, setMode] = useState(null); // 'voice' 또는 'text'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');  // finalTranscript를 state로 관리
  const [summary, setSummary] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);  // 검색 중 상태
  const [searchTime, setSearchTime] = useState(0);  // 검색 시간 (초)
  const searchTimerRef = useRef(null);  // 타이머 참조

  // 음성 인식 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // 이전 텍스트를 유지하면서 새로운 결과 추가
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // 최종 결과와 중간 결과를 합쳐서 표시
        setTranscript(prevTranscript => {
          // 이전 최종 결과에 새로운 결과 추가
          const newTranscript = finalTranscript + interimTranscript;
          return newTranscript;
        });
      };

      recognition.onend = () => {
        // 녹음 중이면 자동으로 다시 시작
        if (isListening) {
          recognition.start();
        }
      };

      setRecognition(recognition);
    }
  }, [isListening]); // isListening을 의존성 배열에 추가

  // initialMode가 변경될 때 모드 설정 및 음성 녹음 시작
  useEffect(() => {
    if (isOpen && initialMode === 'voice') {
      setMode('voice');
      // 약간의 지연 후 녹음 시작
      setTimeout(() => {
        if (recognition) {
          recognition.start();
          setIsListening(true);
          setTranscript('');
          setSummary(null);
        }
      }, 100);
    }
  }, [isOpen, initialMode]);

  // 텍스트 처리 함수
  const processTranscript = async (text) => {
    setIsProcessing(true);
    try {
      console.log('텍스트 처리 시작:', text);
      
      // 1. 텍스트를 LLM으로 분석하여 의도와 정보 추출
      const extractResponse = await axios.post(`${API_BASE_URL}/extract_info/`, {
        user_message: text,
        chat_history: ""  // 빈 문자열로 전달
      });

      console.log('서버 응답:', extractResponse);

      if (!extractResponse.data) {
        console.error('서버 응답에 data가 없음');
        throw new Error('정보 추출 실패: 서버 응답 없음');
      }

      const extractedData = {
        직무: extractResponse.data.직무 || "",
        지역: extractResponse.data.지역 || "",
        연령대: extractResponse.data.연령대 || ""
      };

      console.log('추출된 데이터:', extractedData);

      // 2. 추출된 정보를 요약 형태로 저장
      setSummary({
        originalText: text,
        ...extractedData
      });
      
    } catch (error) {
      console.error('텍스트 처리 중 상세 에러:', error);
      console.error('에러 응답:', error.response?.data);
      alert('텍스트 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      // 에러 발생 시 초기화
      setTranscript('');
      setSummary(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // 음성 입력 시작
  const startListening = () => {
    if (recognition) {
      setFinalTranscript('');  // finalTranscript 초기화
      setTranscript('');  // transcript 초기화
      recognition.start();
      setIsListening(true);
      setSummary(null);
    } else {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  };

  // 음성 입력 중지
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // 요약 내용 확인 및 검색 시작
  const handleConfirm = async () => {
    if (summary) {
      try {
        setIsSearching(true);  // 검색 시작
        setSearchTime(0);  // 타이머 초기화

        // 타이머 시작
        searchTimerRef.current = setInterval(() => {
          setSearchTime(prev => prev + 1);
        }, 1000);

        const searchResponse = await axios.post(`${API_BASE_URL}/chat/`, {
          user_message: summary.originalText,
          user_profile: {
            jobType: summary.직무,
            location: summary.지역,
            age: summary.연령대
          }
        }, {
          withCredentials: true
        });

        // 모든 음성 입력 관련 상태 초기화
        setFinalTranscript('');
        setTranscript('');
        setSummary(null);

        onSubmit({
          ...searchResponse.data,
          mode: 'voice',
          originalText: summary.originalText
        });
        onClose();
        
      } catch (error) {
        console.error('검색 중 오류:', error);
        alert('검색 중 오류가 발생했습니다.');
      } finally {
        setIsSearching(false);  // 검색 종료
        if (searchTimerRef.current) {
          clearInterval(searchTimerRef.current);  // 타이머 정지
          searchTimerRef.current = null;
        }
      }
    }
  };

  // 요약 내용 수정 요청
  const handleRetry = () => {
    setFinalTranscript('');  // finalTranscript 초기화
    setTranscript('');
    setSummary(null);
    startListening();
  };

  // 텍스트 모드 선택 시 모달 닫기
  const handleTextModeSelect = () => {
    onClose();  // 모달 닫기
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {!mode ? (
          // 초기 선택 화면
          <div className={styles.modeSelection}>
            <h2>입력 방식을 선택해주세요</h2>
            <div className={styles.modeButtons}>
              <button 
                className={styles.modeButton}
                onClick={() => setMode('voice')}
              >
                <span className="material-symbols-rounded">mic</span>
                음성
              </button>
              <button 
                className={styles.modeButton}
                onClick={handleTextModeSelect}
              >
                <span className="material-symbols-rounded">chat</span>
                문자
              </button>
            </div>
          </div>
        ) : mode === 'voice' ? (
          // 음성 입력 화면
          <div className={styles.voiceMode}>
            {!summary ? (
              // 음성 녹음 화면
              <div className={styles.recordingSection}>
                <div 
                  className={`${styles.recordingIndicator} ${isListening ? styles.active : ''}`}
                  onClick={isListening ? null : startListening}
                >
                  {isListening ? '녹음 중...' : '녹음 시작'}
                </div>
                {transcript && (
                  <div className={styles.transcript}>
                    <h4>인식된 텍스트:</h4>
                    <p>{transcript}</p>
                    {isProcessing && (
                      <div className={styles.processing}>
                        텍스트 분석 중...
                      </div>
                    )}
                    {isListening && (
                      <button 
                        className={styles.confirmRecording}
                        onClick={() => {
                          stopListening();
                          processTranscript(transcript);
                        }}
                      >
                        녹음 완료
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // 요약 확인 화면
              <div className={styles.summarySection}>
                <h3>입력 내용 확인</h3>
                <div className={styles.summaryContent}>
                  <div className={styles.originalText}>
                    <h4>원본 텍스트:</h4>
                    <p>{summary.originalText}</p>
                  </div>
                  <div className={styles.extractedInfo}>
                    <h4>추출된 정보:</h4>
                    <p><strong>지역:</strong> {summary.지역 || "없음"}</p>
                    <p><strong>직무:</strong> {summary.직무 || "없음"}</p>
                    {summary.연령대 && (
                      <p><strong>연령대:</strong> {summary.연령대}</p>
                    )}
                  </div>
                </div>
                <div className={styles.summaryActions}>
                  <button 
                    onClick={handleConfirm}
                    className={`${styles.confirmButton} ${isSearching ? styles.loading : ''}`}
                    disabled={isSearching}
                  >
                    <div className={styles.loadingText}>
                      {isSearching ? '검색 중...' : '확인하고 검색'}
                      {isSearching && (
                        <span className={styles.loadingTimer}>{searchTime}s</span>
                      )}
                    </div>
                  </button>
                  <button 
                    onClick={handleRetry}
                    className={styles.retryButton}
                    disabled={isSearching}
                  >
                    다시 입력
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default IntentModal; 