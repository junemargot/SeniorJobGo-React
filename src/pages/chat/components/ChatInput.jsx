import React from 'react';
import styles from '../styles/chat.module.scss';

const ChatInput = ({
  userMessage,
  isBotResponding,
  isVoiceMode,
  onSubmit,
  onChange,
  onVoiceInputClick,
  onStopResponse,
  onDeleteChats
}) => {
  return (
    <div className={styles.promptContainer}>
      <div className={styles.promptWrapper}>
        {isVoiceMode ? (
          <button
            className={`${styles.voiceInputButton}`}
            onClick={onVoiceInputClick}
            disabled={isBotResponding}
          >
            <span className="material-symbols-rounded">mic</span>
          </button>
        ) : (
          <form onSubmit={onSubmit} className={styles.promptForm}>
            <input
              type="text"
              className={styles.promptInput}
              placeholder="궁금하신 내용을 입력해주세요"
              value={userMessage}
              onChange={onChange}
              required
              disabled={isBotResponding}
            />
            <div className={styles.promptActions}>
              <button
                type="button"
                onClick={onStopResponse}
                disabled={!isBotResponding}
                className={`material-symbols-rounded ${styles.stopResponseBtn}`}
                id="stop-response-btn"
              >
                stop_circle
              </button>
              <button
                type="submit"
                disabled={!userMessage.trim()}
                className={`material-symbols-rounded ${styles.sendPromptBtn}`}
                id="send-prompt-btn"
              >
                arrow_upward
              </button>
            </div>
          </form>
        )}
        <button
          type="button"
          onClick={onDeleteChats}
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
  );
};

export default ChatInput; 