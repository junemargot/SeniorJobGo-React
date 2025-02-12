import React, { useState, useEffect } from 'react';
import styles from './styles/IntentModal.module.scss';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

const IntentModal = ({ isOpen, onClose, onSubmit, initialMode }) => {
  const [mode, setMode] = useState(null); // 'voice' 또는 'text'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 음성 인식 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ko-KR';

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsListening(false);
        
        // 음성 인식이 완료되면 자동으로 요약 처리 시작
        await processTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

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
      // 1. 텍스트를 LLM으로 분석하여 의도와 정보 추출
      const extractResponse = await axios.post(`${API_BASE_URL}/extract_info/`, {
        user_message: text,
        chat_history: ""  // 빈 문자열로 전달
      });

      if (!extractResponse.data) {
        throw new Error('정보 추출 실패');
      }

      // 2. 추출된 정보를 요약 형태로 저장
      setSummary({
        originalText: text,
        직무: extractResponse.data.직무 || "",
        지역: extractResponse.data.지역 || "",
        연령대: extractResponse.data.연령대 || ""
      });
      
    } catch (error) {
      console.error('텍스트 처리 중 오류:', error);
      alert('텍스트 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 음성 입력 시작
  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
      setTranscript('');
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
        // 3. 사용자가 확인한 요약 정보로 실제 검색 수행
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

        // 4. 검색 결과를 부모 컴포넌트로 전달
        onSubmit({
          ...searchResponse.data,
          mode: 'voice',  // 음성 입력 모드 정보 추가
          originalText: summary.originalText  // 원본 텍스트 추가
        });
        onClose();  // 모달 닫기
        
      } catch (error) {
        console.error('검색 중 오류:', error);
        alert('검색 중 오류가 발생했습니다.');
      }
    }
  };

  // 요약 내용 수정 요청
  const handleRetry = () => {
    setTranscript('');
    setSummary(null);
    startListening();
  };

  // 텍스트 모드 선택 시 모달 닫기
  const handleTextModeSelect = () => {
    onClose();  // 모달 닫기
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {!mode ? (
          // 초기 선택 화면
          <div className={styles.modeSelection}>
            <h2>원하시는 입력 방식을 선택해주세요</h2>
            <div className={styles.modeButtons}>
              <button 
                className={styles.modeButton}
                onClick={() => setMode('voice')}
              >
                음성으로 시작하기
              </button>
              <button 
                className={styles.modeButton}
                onClick={handleTextModeSelect}
              >
                텍스트로 시작하기
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
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? '클릭하여 녹음 중지' : '클릭하여 녹음 시작'}
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
                    className={styles.confirmButton}
                  >
                    확인하고 검색
                  </button>
                  <button 
                    onClick={handleRetry}
                    className={styles.retryButton}
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