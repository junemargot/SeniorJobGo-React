export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// API_BASE_URL 확인용 로그
console.log('현재 API_BASE_URL:', API_BASE_URL);

// 기타 환경변수들
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
export const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
