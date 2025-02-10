// TTS기능 컴포넌트 입니다.
import React, { useState, forwardRef, useImperativeHandle } from "react";

const API_KEY = "sk_d5d1a8552816874b92dbe3b03a74d3c7626b5866de7cc497";
const VOICE_ID = "D38z5RcWu1voky8WS1ja";

const VoiceChatbot = forwardRef((props, ref) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useImperativeHandle(ref, () => ({
    speak: async (text) => {
      if (isSpeaking) return;

      setIsSpeaking(true);
      try {
        console.log("TTS 요청 시작:", text);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        console.log("TTS 응답 상태:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("TTS 에러 데이터:", errorData);
          throw new Error(`TTS 요청 실패: ${response.status}`);
        }

        const blob = await response.blob();
        console.log("오디오 블롭 크기:", blob.size);

        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (e) => {
          console.error("오디오 재생 에러:", e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          const fallbackSpeech = new SpeechSynthesisUtterance(text);
          fallbackSpeech.lang = 'ko-KR';
          window.speechSynthesis.speak(fallbackSpeech);
        };

        console.log("오디오 재생 시도");
        await audio.play();
      } catch (error) {
        console.error("TTS 전체 오류:", error);
        setIsSpeaking(false);
        const fallbackSpeech = new SpeechSynthesisUtterance(text);
        fallbackSpeech.lang = 'ko-KR';
        window.speechSynthesis.speak(fallbackSpeech);
      }
    }
  }));

  return null;
});

export default VoiceChatbot;