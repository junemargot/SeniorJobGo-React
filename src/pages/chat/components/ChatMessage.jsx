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
  selectedCardRef 
}) => {
  const getMessageStyle = (msg) => {
    const baseStyle = styles.message;
    if (msg.role === "model" || msg.role === "bot") {
      return `${baseStyle} ${styles.botMessage} ${msg.loading ? styles.loading : ""}`;
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
            ),
            p: ({ node, ...props }) => (
              <p {...props} className={styles.paragraph} />
            )
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={getMessageStyle(message)}>
      {(message.role === "model" || message.role === "bot") && 
        <img src={Avatar} alt="avatar" className={styles.avatar} />
      }
      <div className={styles.messageContent}>
        {message.loading ? (
          <>
            <div className={styles.loadingBar} />
            <div className={styles.processingTime}>답변 생성 중...</div>
          </>
        ) : (
          <>
            {formatMessage(message.text)}

            {/* 채용정보 목록 */}
            {message.jobPostings && message.jobPostings.length > 0 && (
              <div className={styles.jobList}>
                {message.jobPostings.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={onJobClick}
                    isSelected={selectedJob && selectedJob.id === job.id}
                    cardRef={selectedJob && selectedJob.id === job.id ? selectedCardRef : null}
                  />
                ))}
              </div>
            )}

            {/* 훈련과정 목록 */}
            {message.trainingCourses && message.trainingCourses.length > 0 && (
              <div className={styles.trainingList}>
                {message.trainingCourses.map(course => (
                  <TrainingCard
                    key={course.id}
                    training={{
                      ...course,
                      yardMan: course.yardMan || '미정'
                    }}
                    onClick={onTrainingClick}
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
  );
};

export default ChatMessage; 