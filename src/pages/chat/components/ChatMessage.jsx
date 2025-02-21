import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/chat.module.scss';
import JobCard from './JobCard';
import TrainingCard from './TrainingCard';
import Avatar from '@assets/images/icon-robot.svg';

const ChatMessage = ({ 
  message, 
  selectedJob,
  selectedTraining,
  onJobClick,
  onTrainingClick,
  onResumeAction,
  selectedCardRef,
  isLast
}) => {
  const isBot = message.role === "bot";
  const isUser = message.role === "user";
  const isLoading = message.loading;

  const getMessageStyle = (msg) => {
    const baseStyle = styles.message;
    if (msg.role === "model" || msg.role === "bot") {
      return `${baseStyle} ${styles.botMessage} ${msg.loading ? styles.loading : ""} ${msg.mode === 'voice' ? styles.voiceLoading : ""}`;
    }
    return `${baseStyle} ${styles.userMessage}`;
  };

  const formatMessage = (text) => {
    if (!text) return '';

    return (
      <div className={styles.messageContent}>
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                className={styles.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            em: ({ node, ...props }) => (
              <em {...props} className={styles.sourceText} />
            ),
            h4: ({ node, ...props }) => (
              <h4 {...props} className={styles.searchResultTitle} />
            )
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  const handleResumeAction = (action) => {
    if (onResumeAction && message.html_content) {
      onResumeAction(action, {
        ...message.resume_data,
        html_content: message.html_content
      });
    }
  };

  if (message.type === "resume_advisor") {
    return (
      <div className={`${styles.message} ${styles.botMessage}`}>
        <img src={Avatar} alt="Bot" className={styles.avatar} />
        <div className={styles.messageContent}>
          <p>{message.message}</p>
          {message.html_content && (
            <div className={styles.resumePreview}>
              <div dangerouslySetInnerHTML={{ __html: message.html_content }} />
            </div>
          )}
          {message.suggestions && (
            <div className={styles.suggestions}>
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={styles.suggestionButton}
                  onClick={() => handleResumeAction(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.message} ${isBot ? styles.botMessage : ''} ${isUser ? styles.userMessage : ''} ${isLoading ? styles.loading : ''}`}>
      {isBot && <img src={Avatar} alt="Bot" className={styles.avatar} />}
      <div className={styles.messageContent}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className={styles.loadingText}>답변을 준비중입니다...</div>
          </div>
        ) : (
          <div className={styles.messageText}>
            {!message.jobPostings?.length && !message.trainingCourses?.length && (
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className={styles.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p {...props}  />
                  )
                }}
              >
                {message.text}
              </ReactMarkdown>
            )}
            
            {message.jobPostings?.length > 0 && (
              <div className={styles.jobList}>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p {...props} className={styles.paragraph} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} />
                    )
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                {message.jobPostings.map((job, index) => (
                  <div key={job.id} className={styles.itemGroup}>
                    <JobCard
                      job={job}
                      onClick={onJobClick}
                      isSelected={selectedJob && selectedJob.id === job.id}
                      cardRef={selectedJob && selectedJob.id === job.id ? selectedCardRef : null}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {message.trainingCourses?.length > 0 && (
              <div className={styles.trainingList}>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p {...props} className={styles.paragraph} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className={styles.courseList} />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className={styles.courseItem} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} />
                    )
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                <div className={styles.courseCards}>
                  {message.trainingCourses.map((course, index) => (
                    <div key={course.id} className={styles.itemGroup}>
                      <TrainingCard
                        training={{
                          ...course,
                          yardMan: course.yardMan || '미정'
                        }}
                        onClick={onTrainingClick}
                        isSelected={selectedTraining && selectedTraining.id === course.id}
                        cardRef={selectedTraining && selectedTraining.id === course.id ? selectedCardRef : null}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 