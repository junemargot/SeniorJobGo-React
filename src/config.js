// 환경변수 설정 (Vite 또는 Webpack에 따라 다르게 가져오기)
const API_KEY = 
  typeof import.meta !== "undefined" && import.meta.env.VITE_GEMINI_API_KEY 
    ? import.meta.env.VITE_GEMINI_API_KEY 
    : process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ 환경변수(REACT_APP_GEMINI_API_KEY 또는 VITE_GEMINI_API_KEY)가 설정되지 않았습니다.");
}

export const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;