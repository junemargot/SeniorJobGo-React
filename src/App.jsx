import React from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from "axios";
import './assets/styles/reset.css';
import './assets/styles/fonts.css';  // 폰트 CSS만 import

// const API_BASE_URL = import.meta.env.API_BASE_URL;

// export const chatWithAI = async (userMessage, userProfile) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/chat/`, {
//       user_message: userMessage,
//       user_profile: userProfile,
//     });
//     return response.data;

//   } catch (error) {
//     console.error("API 요청 오류:", error);
    
//     return null;
//   }
// };

// 페이지 컴포넌트
// import IntroPage from '@pages/index'
import Intro from '@pages/index';
import Signin from '@pages/auth/signin';
import Signup from '@pages/auth/signup';
import SignupWithId from '@pages/auth/signup/components/SignupWithId'; // 추가
import Main from '@pages/main';
import Chat from '@pages/chat';
import FindAccount from '@pages/auth/find';
import ResumePage from '@pages/resume';

// Resume 컴포넌트 import - 하나만 유지
import Resume from './pages/resume';  // 상대 경로로 변경

// 전역 스타일
// import '@assets/styles/main.scss';

// Resume를 일반 import로 변경
// const Resume = React.lazy(() => import('./pages/resume'));

function App() {
  console.log('App 렌더링');  // 디버깅용
  
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/id" element={<SignupWithId />} />
      <Route path="/find-account" element={<FindAccount />} />
      <Route path="/main" element={<Main />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/resume" element={<ResumePage />} />
    </Routes>
  );
}

export default App