import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ttsService from '../services/audio/ttsService';
import AICharacter from './AICharacter';

interface AIQuestionSectionProps {
  questionText: string;
  onQuestionComplete?: () => void;
  isAIResponse?: boolean; // AI 응답인지 구분
  onShowCamera?: () => void; // 카메라로 돌아가기 콜백
}

export default function AIQuestionSection({ questionText, onQuestionComplete, isAIResponse = false, onShowCamera }: AIQuestionSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // 컴포넌트 마운트 시 자동으로 TTS 재생 (AI 응답이 아닐 때만)
  useEffect(() => {
    const playQuestion = async () => {
      if (!hasPlayed && questionText && questionText.trim() && !isAIResponse) {
        try {
          setIsPlaying(true);
          
          // 이전 TTS 완전 정리
          await ttsService.stopAudio();
          
          const ttsResult = await ttsService.synthesizeText(questionText);
          
          if (ttsResult && ttsResult.audioData) {
            await ttsService.playAudio(ttsResult.audioData, ttsResult.format);
            setHasPlayed(true);
            onQuestionComplete?.();
          } else {
            console.error('TTS 변환 실패');
          }
        } catch (error) {
          console.error('TTS 재생 실패:', error);
        } finally {
          setIsPlaying(false);
        }
      } else if (!questionText || !questionText.trim()) {
        // 텍스트가 없어도 질문 완료로 처리
        setHasPlayed(true);
        onQuestionComplete?.();
      } else if (isAIResponse) {
        // AI 응답일 때는 TTS 재생 없이 바로 완료 처리
        setHasPlayed(true);
        onQuestionComplete?.();
      }
    };

    playQuestion();

    return () => {
      ttsService.stopAudio();
    };
  }, [questionText, hasPlayed, isAIResponse]);

  // tts 수동 재생
  const handlePlayQuestion = async () => {
    if (isPlaying) {
      await ttsService.stopAudio();
      setIsPlaying(false);
      return;
    }

    if (!questionText || !questionText.trim()) {
      console.warn('재생할 텍스트가 없습니다:', questionText);
      return;
    }

    try {
      setIsPlaying(true);
      
      // 이전 TTS 완전 정리
      await ttsService.stopAudio();
      
      const ttsResult = await ttsService.synthesizeText(questionText);
      
      if (ttsResult && ttsResult.audioData) {
        await ttsService.playAudio(ttsResult.audioData, ttsResult.format);
      } else {
        console.error('TTS 변환 실패');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('질문 재생 실패:', error);
      setIsPlaying(false);
    }
  };

  return (
    <View className="absolute top-20 left-0 right-0 z-10 px-6">
      {/* AI 캐릭터와 말풍선을 화면 위쪽에 고정 */}
      <View className="items-center">
        {/* AI 캐릭터 */}
        <TouchableOpacity 
          onPress={handlePlayQuestion}
          className="w-32 h-32 justify-center items-center mb-6"
          activeOpacity={0.7}
        >
          <AICharacter />
          {/* 재생/정지 표시 */}
          <View className="absolute bottom-2 right-2">
            <Text className="text-lg">
              {/* {isPlaying ? '다시 재생' : '재생 중입니다..'} */}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* 말풍선 */}
        <View className="bg-gray-100 rounded-2xl p-4 mx-4 relative">
          {/* 말풍선 꼬리 */}
          <View className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <View className="w-4 h-4 bg-gray-100 rotate-45"></View>
          </View>
          <Text className="text-2xl text-center text-gray-800 leading-8">
            {questionText}
          </Text>
        </View>
        
        {/* 카메라로 돌아가기 버튼 - AI 응답일 때만 표시 */}
        {isAIResponse && onShowCamera && (
          <View className="mt-6">
            <TouchableOpacity 
              onPress={onShowCamera}
              activeOpacity={0.7}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            >
              <Text className="text-white text-lg font-medium text-center">
                카메라 보기
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </View>
  );
}
