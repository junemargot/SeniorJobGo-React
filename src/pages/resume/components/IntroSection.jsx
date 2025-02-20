import { useState } from 'react';
import { Button, Textarea, Box, Text } from '@chakra-ui/react';

export const IntroSection = ({ resumeData, onIntroChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const generateIntro = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/resume/generate-intro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) throw new Error('자기소개서 생성 실패');
      
      const data = await response.json();
      onIntroChange(data.content);
    } catch (error) {
      console.error('자기소개서 생성 오류:', error);
      alert('자기소개서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={2}>자기소개서</Text>
      <Textarea
        value={resumeData.additional_info || ''}
        onChange={(e) => onIntroChange(e.target.value)}
        placeholder="자기소개서를 입력하세요"
        rows={10}
        mb={2}
      />
      <Button
        colorScheme="blue"
        onClick={generateIntro}
        isLoading={isLoading}
        loadingText="생성 중..."
      >
        AI 자기소개서 생성
      </Button>
    </Box>
  );
}; 