import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from "axios";
import '@assets/styles/reset.css';

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
import FindAccount from '@pages/auth/find';

// 전역 스타일
// import '@assets/styles/main.scss';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Intro />}></Route>
        <Route path='/signin' element={<Signin />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/signup/id' element={<SignupWithId />}></Route>
        <Route path='/find-account' element={<FindAccount />}></Route>
        <Route path='/main' element={<Main />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App