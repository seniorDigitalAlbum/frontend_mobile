import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ttsService from '../services/audio/ttsService';
import AICharacter from './AICharacter';

interface AIQuestionSectionProps {
  questionText: string;
  onQuestionComplete?: () => void;
}

export default function AIQuestionSection({ questionText, onQuestionComplete }: AIQuestionSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // 컴포넌트 마운트 시 자동으로 TTS 재생
  useEffect(() => {
    const playQuestion = async () => {
      if (!hasPlayed && questionText && questionText.trim()) {
        try {
          setIsPlaying(true);
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
      }
    };

    playQuestion();

    return () => {
      ttsService.stopAudio();
    };
  }, [questionText, hasPlayed]);

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
    <View className="flex-1 justify-center items-center mb-8">
      {/* AI 캐릭터 */}
      <TouchableOpacity 
        onPress={handlePlayQuestion}
        className="w-32 h-32 bg-blue-100 rounded-full justify-center items-center mb-6"
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
      <View className="bg-gray-100 rounded-2xl p-4 mx-4 mb-4 relative">
        {/* 말풍선 꼬리 */}
        <View className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <View className="w-4 h-4 bg-gray-100 rotate-45"></View>
        </View>
        <Text className="text-lg text-center text-gray-800 leading-6">
          {questionText}
        </Text>
      </View>

      {/* TTS 재생 상태 표시 */}
      {isPlaying && (
        <View className="bg-blue-100 px-4 py-2 rounded-full">
          <Text className="text-blue-600 font-medium text-center">
            🔊 AI가 질문을 읽고 있습니다...
          </Text>
        </View>
      )}
    </View>
  );
}
