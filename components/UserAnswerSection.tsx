import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AnswerMic from './AnswerMic';
import { colors } from '../styles/commonStyles';

interface UserAnswerSectionProps {
  questionId: string | number;
  microphoneSessionId: string | null;
  cameraSessionId?: string | null;
  conversationId?: string | null;
  userId?: string | null;
  onRecordingComplete: (audioUri: string, questionId: string) => void;
  onRecordingStart: (questionId: string) => void;
  onAIResponse?: (aiResponse: string, audioBase64?: string) => void;
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
            questionId={String(questionId || `question-${Date.now()}`)}
            microphoneSessionId={microphoneSessionId || undefined}
            cameraSessionId={cameraSessionId || undefined}
            conversationId={conversationId || undefined}
            userId={userId || undefined}
            onRecordingComplete={onRecordingComplete}
            onRecordingStart={onRecordingStart}
            onAIResponse={onAIResponse}
            maxDuration={120} // 2분으로 설정
          />
          
        </View>
      )}

      {/* 버튼들 */}
      <View className="w-full">
        {/* 이 대화를 끝낼래요 - 검정색 배경 버튼으로 표시 */}
        {isQuestionComplete && (
          <View className="items-center">
            <TouchableOpacity 
              onPress={onEndChat} 
              activeOpacity={0.7}
              className="px-8 py-4 rounded-full"
              style={{ backgroundColor: colors.black }}
            >
              <Text className="text-white text-2xl font-medium">
                이 대화를 끝낼래요
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
