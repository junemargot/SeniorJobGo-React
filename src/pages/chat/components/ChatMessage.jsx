import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/chat.module.scss';
import JobCard from './JobCard';
import TrainingCard from './TrainingCard';
import Avatar from '@assets/images/icon-robot.svg';
import PolicyCard from './PolicyCard';
import MealCard from './MealCard';

const ChatMessage = ({ 
  message, 
  selectedJob,
  selectedTraining,
  selectedPolicy,
  selectedMeal,
  onJobClick,
  onTrainingClick,
  onPolicyClick,
  onMealClick,
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
            {!message.jobPostings?.length && !message.trainingCourses?.length && !message.policyPostings?.length && !message.mealPostings?.length && (
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

            {message.policyPostings?.length > 0 && (
              <div className={styles.policyList}>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p {...props} className={styles.paragraph} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className={styles.policyList} />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className={styles.policyItem} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} />
                    )
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                <div className={styles.policyCards}>
                  {message.policyPostings.map((policy, index) => (
                    <div key={`${policy.source}-${policy.title}-${index}`} className={styles.itemGroup}>
                      <PolicyCard
                        policy={policy}
                        onClick={onPolicyClick}
                        isSelected={selectedPolicy && selectedPolicy.id === policy.id}
                        cardRef={selectedPolicy && selectedPolicy.id === policy.id ? selectedCardRef : null}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.mealPostings?.length > 0 && (
              <div className={styles.mealList}>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p {...props} className={styles.paragraph} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className={styles.mealList} />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className={styles.mealItem} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} />
                    )
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                <div className={styles.mealCards}>
                  {message.mealPostings.map((meal, index) => (
                    <div key={`${meal.fcltyNm}-${index}`} className={styles.itemGroup}>
                      <MealCard
                        meal={meal}
                        onClick={onMealClick}
                        isSelected={selectedMeal && selectedMeal.fcltyNm === meal.fcltyNm}
                        cardRef={selectedMeal && selectedMeal.fcltyNm === meal.fcltyNm ? selectedCardRef : null}
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