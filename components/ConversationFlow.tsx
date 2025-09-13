/**
 * ConversationFlow 컴포넌트
 * 
 * 대화 플로우의 전체적인 흐름을 관리하는 메인 컴포넌트입니다.
 * 권한 요청부터 세션 생성, 사용자 응답 처리까지 모든 단계를 순차적으로 진행합니다.
 * 
 * 플로우 단계:
 * 1. B-1: 카메라/마이크 권한 요청
 * 2. B-2: 카메라 프리뷰 테스트
 * 3. B-3: 마이크 1초 녹음 테스트
 * 4. C-1: AI 질문 TTS 재생
 * 5. D-1: 카메라·마이크 세션 생성
 * 6. D-2: 사용자 답변 처리
 * 7. 세션 정리 및 완료
 */

import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import PermissionManager from './PermissionManager';
import CameraPreviewTest from './CameraPreviewTest';
import MicrophoneTest from './MicrophoneTest';
import sessionManager from '../services/sessionManager';
import userResponseProcessor from '../services/userResponseProcessor';
import ttsService from '../services/audio/ttsService';
import { useConversation, conversationActions } from '../contexts/ConversationContext';
import { ConversationFlowProps } from '../types/conversation';
import { ERROR_MESSAGES, TIMING } from '../constants/conversation';
import { showErrorAlert, formatLogMessage } from '../utils/conversationUtils';
import conversationApiService from '../services/api/conversationApiService';

/**
 * ConversationFlow 컴포넌트 메인 함수
 * 
 * @param props - 컴포넌트 Props
 * @returns JSX.Element
 */
export default function ConversationFlow({
  questionText,
  questionId,
  conversationId,
  userId,
  onFlowComplete,
  onFlowError
}: ConversationFlowProps) {
  // Context에서 상태와 디스패치 함수 가져오기
  const { state, dispatch } = useConversation();
  const navigation = useNavigation<any>();

  /**
   * 컴포넌트 마운트 시 플로우 초기화
   * 언마운트 시 세션 정리
   */
  useEffect(() => {
    initializeFlow();
    return () => {
      // 컴포넌트 언마운트 시 세션 정리
      sessionManager.cleanupSessions();
    };
  }, []);

  /**
   * 각 단계별 처리
   */
  useEffect(() => {
    switch (state.currentStep) {
      case 'camera_test':
        // CameraTest 화면으로 네비게이션
        navigation.navigate('CameraTest', {
          questionText: state.conversationInfo.questionText,
          questionId: state.conversationInfo.questionId,
          conversationId: state.conversationInfo.conversationId,
          cameraSessionId: state.sessionIds.cameraSessionId,
          microphoneSessionId: state.sessionIds.microphoneSessionId
        });
        break;
      case 'tts_playback':
        handleTTSPlayback();
        break;
      // session_create, user_response, session_cleanup, complete는 
      // AIChat → UserAnswer 플로우에서 처리되므로 ConversationFlow에서는 제거
    }
  }, [state.currentStep]);

  /**
   * 화면 포커스 시 카메라 테스트 완료 확인
   * CameraTest 화면에서 돌아왔을 때 대화 세션 생성 후 다음 단계로 진행
   */
  useFocusEffect(
    React.useCallback(() => {
      // 포커스 시 카메라 테스트 완료 처리
      if (state.currentStep === 'camera_test') {
        setTimeout(async () => {
          try {
                 // 대화 세션 시작 API 호출
                 const userId = '1'; // 하드코딩된 사용자 ID
                 const startResponse = await conversationApiService.startConversation({
                   userId,
                   questionId: state.conversationInfo.questionId || 5
                 });

                 console.log('대화 세션 시작됨:', startResponse);

                 // 세션 ID를 Context에 저장
                 dispatch(conversationActions.setSessionIds({
                   cameraSessionId: startResponse.cameraSessionId,
                   microphoneSessionId: startResponse.microphoneSessionId
                 }));

                 // 대화 정보 업데이트 (initialize 액션 사용)
                 dispatch(conversationActions.initialize({
                   ...state.conversationInfo,
                   conversationId: startResponse.conversationId.toString(),
                   questionText: startResponse.question.content,
                   questionId: startResponse.question.id
                 }));

            dispatch(conversationActions.setCameraTestResult('success'));
            dispatch(conversationActions.setMicrophoneTestResult('success'));
            dispatch(conversationActions.setStep('tts_playback'));
          } catch (error) {
            console.error('대화 세션 시작 실패:', error);
            dispatch(conversationActions.setError('대화 세션을 시작할 수 없습니다.'));
          }
        }, 100);
      }
    }, [state.currentStep, dispatch, state.conversationInfo])
  );

  /**
   * 대화 플로우 초기화 함수
   * Context에 대화 정보를 설정하고 초기 상태로 설정합니다.
   */
  const initializeFlow = async () => {
    try {
      console.log(formatLogMessage('INITIALIZE', '대화 플로우 초기화 시작'));
      dispatch(conversationActions.initialize({
        questionText,
        questionId,
        conversationId,
        userId
      }));
    } catch (error) {
      console.error(formatLogMessage('INITIALIZE', '플로우 초기화 실패'), error);
      dispatch(conversationActions.setError(ERROR_MESSAGES.FLOW_INITIALIZATION_FAILED));
      onFlowError(ERROR_MESSAGES.FLOW_INITIALIZATION_FAILED);
    }
  };

  /**
   * B-1: 권한 요청 완료 핸들러
   * 카메라와 마이크 권한이 모두 허용되었을 때 호출됩니다.
   */
  const handlePermissionsGranted = () => {
    console.log(formatLogMessage('B-1', '권한 요청 완료'));
    dispatch(conversationActions.setPermissions({ camera: true, microphone: true }));
    dispatch(conversationActions.setStep('camera_test'));
  };

  /**
   * B-1: 권한 요청 거부 핸들러
   * 카메라 또는 마이크 권한이 거부되었을 때 호출됩니다.
   */
  const handlePermissionsDenied = () => {
    console.log(formatLogMessage('B-1', '권한 요청 거부'));
    dispatch(conversationActions.setError(ERROR_MESSAGES.PERMISSIONS_REQUIRED));
    onFlowError(ERROR_MESSAGES.PERMISSIONS_REQUIRED);
  };

  /**
   * B-2: 카메라 프리뷰 테스트 성공 핸들러
   * 카메라가 정상적으로 작동할 때 호출됩니다.
   */
  const handleCameraTestPassed = () => {
    console.log(formatLogMessage('B-2', '카메라 프리뷰 테스트 완료'));
    dispatch(conversationActions.setCameraTestResult('success'));
    dispatch(conversationActions.setStep('mic_test'));
  };

  /**
   * B-2: 카메라 프리뷰 테스트 실패 핸들러
   * 카메라 테스트가 실패해도 다음 단계로 진행합니다.
   */
  const handleCameraTestFailed = () => {
    console.log(formatLogMessage('B-2', '카메라 프리뷰 테스트 실패'));
    dispatch(conversationActions.setCameraTestResult('failed'));
    // 카메라 테스트 실패해도 계속 진행
    dispatch(conversationActions.setStep('mic_test'));
  };

  /**
   * B-3: 마이크 테스트 성공 핸들러
   * 마이크가 정상적으로 작동할 때 호출됩니다.
   */
  const handleMicTestPassed = () => {
    console.log(formatLogMessage('B-3', '마이크 테스트 완료'));
    dispatch(conversationActions.setMicrophoneTestResult('success'));
    dispatch(conversationActions.setStep('tts_playback'));
  };

  /**
   * B-3: 마이크 테스트 실패 핸들러
   * 마이크 테스트가 실패해도 다음 단계로 진행합니다.
   */
  const handleMicTestFailed = () => {
    console.log(formatLogMessage('B-3', '마이크 테스트 실패'));
    dispatch(conversationActions.setMicrophoneTestResult('failed'));
    // 마이크 테스트 실패해도 계속 진행
    dispatch(conversationActions.setStep('tts_playback'));
  };

  /**
   * C-1: Conversation 화면으로 이동
   * TTS 재생은 Conversation 화면에서 처리합니다.
   */
  const handleTTSPlayback = async () => {
    try {
      console.log(formatLogMessage('C-1', 'Conversation 화면으로 이동'));
      dispatch(conversationActions.setProcessing(true));
      
      // questionText 확인 및 안전한 기본값 설정
      const textToPlay = state.conversationInfo.questionText || questionText || '안녕하세요, 오늘 하루는 어떠셨나요?';
      console.log('Conversation으로 전달할 텍스트:', textToPlay);
      console.log('원본 questionText:', questionText);
      console.log('Context questionText:', state.conversationInfo.questionText);
      
      // 통합 대화 화면으로 이동
      navigation.navigate('Conversation', {
        questionText: textToPlay,
        questionId: state.conversationInfo.questionId,
        conversationId: state.conversationInfo.conversationId,
        cameraSessionId: state.sessionIds.cameraSessionId,
        microphoneSessionId: state.sessionIds.microphoneSessionId
      });
      dispatch(conversationActions.setProcessing(false));
    } catch (error) {
      console.error(formatLogMessage('C-1', 'Conversation 이동 실패'), error);
      dispatch(conversationActions.setProcessing(false));
    }
  };

  /**
   * D-1: 세션 생성 핸들러
   * 카메라와 마이크 세션을 생성합니다.
   * 세션 생성 성공 시 사용자 응답 처리 단계로 진행합니다.
   */
  const handleSessionCreate = async () => {
    try {
      console.log(formatLogMessage('D-1', '세션 생성 시작'));
      dispatch(conversationActions.setProcessing(true));
      
      const sessionResult = await sessionManager.createSessions({
        userId: state.conversationInfo.userId,
        conversationId: state.conversationInfo.conversationId,
        resolution: '1280x720',
        frameRate: 30,
        audioFormat: 'WAV',
        sampleRate: 44100
      });

      if (sessionResult.success) {
        dispatch(conversationActions.setSessionIds({
          cameraSessionId: sessionResult.cameraSessionId,
          microphoneSessionId: sessionResult.microphoneSessionId
        }));
        dispatch(conversationActions.setStep('user_response'));
        dispatch(conversationActions.setProcessing(false));
      } else {
        throw new Error(sessionResult.error || '세션 생성 실패');
      }
    } catch (error) {
      console.error(formatLogMessage('D-1', '세션 생성 실패'), error);
      dispatch(conversationActions.setError(ERROR_MESSAGES.SESSION_CREATION_FAILED));
      dispatch(conversationActions.setProcessing(false));
      onFlowError(ERROR_MESSAGES.SESSION_CREATION_FAILED);
    }
  };

  /**
   * D-2: 사용자 답변 처리 핸들러
   * STT, 감정 분석, GPT 응답 생성 등을 수행합니다.
   * 처리 완료 후 세션 정리 단계로 진행합니다.
   */
  const handleUserResponse = async () => {
    try {
      console.log(formatLogMessage('D-2', '사용자 답변 처리 시작'));
      dispatch(conversationActions.setProcessing(true));
      
      if (!state.sessionIds.cameraSessionId || !state.sessionIds.microphoneSessionId) {
        throw new Error('세션 ID가 없습니다');
      }

      const responseResult = await userResponseProcessor.processUserResponse({
        cameraSessionId: state.sessionIds.cameraSessionId,
        microphoneSessionId: state.sessionIds.microphoneSessionId,
        conversationId: state.conversationInfo.conversationId,
        userId: state.conversationInfo.userId
      });

      if (responseResult.success) {
        console.log(formatLogMessage('D-2', '사용자 답변 처리 완료'));
        dispatch(conversationActions.setUserResponse({
          transcribedText: responseResult.transcribedText || '',
          emotionAnalysis: responseResult.emotionAnalysis,
          timestamp: Date.now()
        }));
        dispatch(conversationActions.setStep('session_cleanup'));
        dispatch(conversationActions.setProcessing(false));
      } else {
        throw new Error(responseResult.error || '사용자 답변 처리 실패');
      }
    } catch (error) {
      console.error(formatLogMessage('D-2', '사용자 답변 처리 실패'), error);
      dispatch(conversationActions.setError(ERROR_MESSAGES.USER_RESPONSE_PROCESSING_FAILED));
      dispatch(conversationActions.setProcessing(false));
      onFlowError(ERROR_MESSAGES.USER_RESPONSE_PROCESSING_FAILED);
    }
  };

  /**
   * 세션 정리 핸들러
   * 생성된 카메라와 마이크 세션을 정리합니다.
   * 정리 완료 후 플로우 완료 단계로 진행합니다.
   */
  const handleSessionCleanup = async () => {
    try {
      console.log(formatLogMessage('CLEANUP', '세션 정리 시작'));
      dispatch(conversationActions.setProcessing(true));
      await sessionManager.cleanupSessions();
      dispatch(conversationActions.setSessionActive(false));
      dispatch(conversationActions.setStep('complete'));
      dispatch(conversationActions.setProcessing(false));
    } catch (error) {
      console.error(formatLogMessage('CLEANUP', '세션 정리 실패'), error);
      // 정리 실패해도 완료로 처리
      dispatch(conversationActions.setStep('complete'));
      dispatch(conversationActions.setProcessing(false));
    }
  };

  /**
   * 플로우 완료 핸들러
   * 대화 플로우가 성공적으로 완료되었을 때 호출됩니다.
   * 결과 데이터를 상위 컴포넌트로 전달합니다.
   */
  const handleComplete = () => {
    console.log(formatLogMessage('COMPLETE', '대화 플로우 완료'));
    onFlowComplete({
      questionText: state.conversationInfo.questionText,
      questionId: state.conversationInfo.questionId,
      conversationId: state.conversationInfo.conversationId,
      userId: state.conversationInfo.userId,
      userResponse: state.userResponse
    });
  };

  /**
   * 현재 플로우 단계에 따른 UI 렌더링 함수
   * 각 단계별로 적절한 컴포넌트를 반환합니다.
   * 
   * @returns JSX.Element - 현재 단계에 맞는 UI 컴포넌트
   */
  const renderCurrentStep = () => {
    // 초기화되지 않은 경우 로딩 화면 표시
    if (!state.isInitialized) {
      return (
        <View className="flex-1 justify-center items-center bg-white">
          <Text className="text-gray-500">초기화 중...</Text>
        </View>
      );
    }

    // 현재 단계에 따른 컴포넌트 렌더링
    switch (state.currentStep) {
      // B-1: 권한 요청 단계
      case 'permissions':
        return (
          <PermissionManager
            onPermissionsGranted={handlePermissionsGranted}
            onPermissionsDenied={handlePermissionsDenied}
          />
        );

      // B-2: 카메라 프리뷰 테스트 단계
      case 'camera_test':
        // CameraTest 화면으로 네비게이션은 useEffect에서 처리
        return (
          <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-lg text-gray-600">카메라 테스트 화면으로 이동 중...</Text>
          </View>
        );

      // B-3: 마이크 테스트 단계
      case 'mic_test':
        return (
          <MicrophoneTest
            onTestPassed={handleMicTestPassed}
            onTestFailed={handleMicTestFailed}
          />
        );

      // C-1: AI 질문 TTS 재생 단계
      case 'tts_playback':
        return (
          <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              AI 질문 재생 중...
            </Text>
            <Text className="text-gray-600 text-center px-6">
              {state.conversationInfo.questionText}
            </Text>
          </View>
        );

      // 다른 단계들은 AIChat → UserAnswer 플로우에서 처리됨

      // 알 수 없는 단계
      default:
        return (
          <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-gray-500">알 수 없는 단계입니다</Text>
          </View>
        );
    }
  };

  /**
   * 컴포넌트 렌더링
   * 현재 단계에 맞는 UI를 표시합니다.
   */
  return (
    <View className="flex-1">
      {renderCurrentStep()}
    </View>
  );
}
