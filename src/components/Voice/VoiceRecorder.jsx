import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './VoiceRecorder.module.css';

const VoiceRecorder = ({ onTranscript, isLoading, onInterimTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recordingStatus, setRecordingStatus] = useState('');
  const [fullText, setFullText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'ko-KR';

      recognitionInstance.onstart = () => {
        console.log("음성 인식 시작");
        setIsRecording(true);
        setRecordingStatus('녹음 중...');
        setInterimText('');
        setFullText('');
      };

      recognitionInstance.onresult = (event) => {
        console.log("음성 인식 결과 수신", event.results);
        let currentInterimTranscript = '';
        let allTranscripts = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            allTranscripts += transcript + ' ';
          } else {
            currentInterimTranscript = transcript;
          }
        }

        const displayText = (allTranscripts + ' ' + currentInterimTranscript).trim();
        
        setInterimText(displayText);
        
        if (allTranscripts) {
          setFullText(allTranscripts.trim());
          onTranscript(allTranscripts.trim());
        }
        
        onInterimTranscript(displayText);
      };

      recognitionInstance.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        if (event.error === 'no-speech') {
          restartRecognition();
        }
        setRecordingStatus(`오류 발생: ${event.error}`);
      };

      recognitionInstance.onend = () => {
        console.log("음성 인식 종료");
        if (isRecording) {
          restartRecognition();
        } else {
          setRecordingStatus('');
          setInterimText('');
        }
      };

      recognitionRef.current = recognitionInstance;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const restartRecognition = () => {
    if (recognitionRef.current && isRecording) {
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("재시작 실패:", error);
        }
      }, 100);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('죄송합니다. 음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
      if (fullText) {
        onTranscript(fullText);
      }
      setInterimText('');
      setRecordingStatus('');
    } else {
      setIsRecording(true);
      setFullText('');
      setInterimText('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Recognition start error:', error);
      }
    }
  };

  return (
    <div className={styles.voice_recorder_container}>
      {isRecording && (
        <div className={styles.interim_transcript}>
          <div className={styles.recording_status}>녹음 중...</div>
          {interimText && <div className={styles.interim_text}>{interimText}</div>}
        </div>
      )}
      <button 
        className={`${styles.mic_button} ${isRecording ? styles.recording : ''}`}
        onClick={toggleVoiceInput}
        disabled={isLoading}
      >
        <i className={`bx ${isRecording ? 'bxs-microphone' : 'bx-microphone'}`}></i>
        <span>{isRecording ? '녹음종료' : '녹음시작'}</span>
      </button>
    </div>
  );
};

VoiceRecorder.propTypes = {
  onTranscript: PropTypes.func.isRequired,
  onInterimTranscript: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default VoiceRecorder;
