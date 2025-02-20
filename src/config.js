// // 환경변수 설정
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// if (!API_KEY) {
//   console.error("❌ 환경변수(VITE_GEMINI_API_KEY)가 설정되지 않았습니다.");
// }

// export const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const API_BASE_URL = 'http://localhost:8000/api/v1';

// 기타 환경변수들
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
export const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
