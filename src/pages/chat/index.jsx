// pages/chat/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from './styles/chat.module.scss';
import Header from '@components/Header/Header';

const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("themeColor") === "light_mode" ? "light" : "dark"
  );
  const chatsContainerRef = useRef(null);
  const API_KEY = "AIzaSyAHuX7olxy-r1zX5SvXSz7rWgJ5WN4KbmA";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  let typingInterval;

  // Scroll to the bottom of the chat container
  const scrollToBottom = () => {
    chatsContainerRef.current?.scrollTo({
      top: chatsContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Simulate typing effect for bot responses
  const typingEffect = (text, callback) => {
    const words = text.split(" ");
    let wordIndex = 0;
    let typedText = "";

    typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        typedText += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        callback(typedText);
        scrollToBottom();
      } else {
        clearInterval(typingInterval);
        setIsBotResponding(false);
      }
    }, 40);
  };

  // Generate bot response
  const generateResponse = async () => {
    setIsBotResponding(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      const responseText =
        data.candidates[0].content.parts[0].text.replace(
          /\*\*([^*]+)\*\*/g,
          "$1"
        ).trim();

      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: responseText },
      ]);

      typingEffect(responseText, (typedText) => {
        setChatHistory((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, text: typedText } : msg
          )
        );
      });
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: error.message || "Error occurred" },
      ]);
      setIsBotResponding(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!userMessage || isBotResponding) return;

    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);
    setUserMessage("");
    generateResponse();
  };

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("themeColor", newTheme === "light" ? "light_mode" : "dark_mode");
  };

  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      {/* Header */}
      <header className={styles.appHeader}>
        <h1 className={styles.heading}>Hello, there</h1>
        <h2 className={styles.subHeading}>How can I help you?</h2>
      </header>

      {/* Suggestions */}
      <ul className={styles.suggestions}>
        {[
          "Design a home office setup for remote work under $500.",
          "How can I level up my web development expertise in 2025?",
          "Suggest some useful tools for debugging JavaScript code.",
          "Create a React JS component for the simple todo list app.",
        ].map((text, index) => (
          <li
            key={index}
            className={styles.suggestionsItem}
            onClick={() => setUserMessage(text)}
          >
            <p className={styles.text}>{text}</p>
            <span className={`${styles.materialSymbolsRounded} material-symbols-rounded`}>lightbulb</span>
          </li>
        ))}
      </ul>

      {/* Chat Container */}
      <div className={styles.chatsContainer} ref={chatsContainerRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[`${msg.role}Message`]}`}>
            {msg.role === "bot" && (
              <img
                src="/assets/images/gemini.svg"
                alt="logo"
                className={styles.avatar}
              />
            )}
            <p className={styles.messageText}>{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Prompt Container */}
      <div className={styles.promptContainer}>
        <form onSubmit={handleFormSubmit} className={styles.promptForm}>
          <input
            type="text"
            className={styles.promptInput}
            placeholder="메세지를 입력해주세요."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            disabled={isBotResponding}
          />
          <div className={styles.promptActions}>
            <button
              id="stop-response-btn"
              type="button"
              onClick={() => clearInterval(typingInterval)}
              disabled={!isBotResponding}
              className={`${styles.materialSymbolsRounded} material-symbols-rounded`}
            >
              stop_circle
            </button>
            <button
              id="send-prompt-btn"
              type="submit"
              disabled={!userMessage}
              className={`${styles.materialSymbolsRounded} material-symbols-rounded`}
            >
              arrow_upward
            </button>
          </div>
        </form>
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className={`${styles.materialSymbolsRounded} material-symbols-rounded`}
        >
          {theme === "light" ? "dark_mode" : "light_mode"}
        </button>
        <button
          id="delete-chats-btn"
          type="button"
          onClick={() => setChatHistory([])}
          className={`${styles.materialSymbolsRounded} material-symbols-rounded`}
        >
          delete
        </button>
      </div>
    </div>
  );
};

export default Chat;