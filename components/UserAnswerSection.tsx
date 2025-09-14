import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AnswerMic from './AnswerMic';
import NextButton from './NextButton';

interface UserAnswerSectionProps {
  questionId: string | number;
  microphoneSessionId: string | null;
  cameraSessionId?: string | null;
  conversationId?: string | null;
  userId?: string | null;
  onRecordingComplete: (audioUri: string, questionId: string) => void;
  onRecordingStart: (questionId: string) => void;
  onAIResponse?: (aiResponse: string, audioBase64?: string) => void;
  onNext: () => void;
  onEndChat: () => void;
  transcribedText?: string | null;
  isRecording?: boolean;
  isQuestionComplete?: boolean; // AI TTS 재생 완료 여부
  hasAIResponse?: boolean; // AI 응답을 받았는지 여부
}

export default function UserAnswerSection({
  questionId,
  microphoneSessionId,
  cameraSessionId,
  conversationId,
  userId,
  onRecordingComplete,
  onRecordingStart,
  onAIResponse,
  onNext,
  onEndChat,
  transcribedText,
  isRecording,
  isQuestionComplete = false,
  hasAIResponse = false
}: UserAnswerSectionProps) {
  return (
    <View className="w-full">
      {/* 답변 녹음 - AI TTS 재생 완료 후에만 표시 */}
      {isQuestionComplete && (
        <View className="items-center mb-8">
          <AnswerMic 
            questionId={questionId || `question-${Date.now()}`}
            microphoneSessionId={microphoneSessionId}
            cameraSessionId={cameraSessionId}
            conversationId={conversationId}
            userId={userId}
            onRecordingComplete={onRecordingComplete}
            onRecordingStart={onRecordingStart}
            onAIResponse={onAIResponse}
            maxDuration={120} // 2분으로 설정
          />
          
          {/* 녹음 상태 표시 */}
          {isRecording && (
            <View className="mt-4 bg-red-100 px-4 py-2 rounded-full">
              <Text className="text-red-600 font-medium">🎤 녹음 중...</Text>
            </View>
          )}
          
          {/* STT 변환 결과 표시 (디버깅용) */}
          {transcribedText && (
            <View className="mt-4 bg-green-100 p-3 rounded-lg max-w-sm">
              <Text className="text-green-800 text-sm">
                변환된 텍스트: {transcribedText}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 버튼들 */}
      <View className="w-full">
        {/* 다음으로 버튼 - AI 응답을 받았을 때만 표시 */}
        {hasAIResponse && (
          <View className="mb-4">
            <NextButton onPress={onNext} />
          </View>
        )}
        
        {/* 이 대화를 끝낼래요 - 줄 쳐진 텍스트로 표시 */}
        {isQuestionComplete && (
          <View className="items-center">
            <TouchableOpacity onPress={onEndChat} activeOpacity={0.7}>
              <Text className="text-gray-500 text-sm underline">
                이 대화를 끝낼래요
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
