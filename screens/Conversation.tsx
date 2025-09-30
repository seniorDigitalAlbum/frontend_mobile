import { View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAccessibility } from '../contexts/AccessibilityContext';
import HiddenCamera from '../components/HiddenCamera';
import AIQuestionSection from '../components/AIQuestionSection';
import UserAnswerSection from '../components/UserAnswerSection';
import { useConversation } from '../hooks/useConversation';
import { ConversationUtils } from '../utils/conversationUtils';
import { colors } from '../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export default function Conversation({ route, navigation }: Props) {
    const { settings } = useAccessibility();

    // 커스텀 훅으로 상태와 로직 분리
    const {
        isRecording,
        transcribedText,
        isQuestionComplete,
        currentQuestionText,
        isProcessingResponse,
        hasAIResponse,
        emotionCaptures,
        isCameraVisible,
        userId,
        questionId,
        conversationId,
        cameraSessionId,
        microphoneSessionId,
        handleQuestionComplete,
        handleEndChat,
        handleAnswerRecordingComplete,
        handleAnswerRecordingStart,
        handleAIResponse,
        handleShowAIMessage,
        handleShowCamera,
        addEmotionCapture,
    } = useConversation({
        ...route.params,
        questionId: route.params?.questionId?.toString()
    });



    return (
        <View className="flex-1 bg-white">
            {/* 카메라 (실시간 이미지 전송) - 전체 화면 차지 */}
            <View className="flex-1">
                <HiddenCamera
                    isRecording={isRecording}
                    isVisible={isCameraVisible}
                    onFaceDetected={(imageData) => {
                        // HiddenCamera에서 이미 감정 분석이 완료된 결과를 받음
                        console.log('📸 이미지 감정 분석 결과 수신:', imageData);

                        if (imageData.emotionResult && imageData.emotionResult.success && isRecording) {
                            const newCapture = {
                                timestamp: imageData.timestamp,
                                emotion: imageData.emotionResult.emotion,
                                confidence: imageData.emotionResult.confidence
                            };

                            addEmotionCapture(newCapture);
                        }
                    }}
                    onRecordingStart={() => {
                        console.log('HiddenCamera: 녹음 시작됨');
                    }}
                    onRecordingStop={() => {
                        console.log('HiddenCamera: 녹음 종료됨');
                    }}
                />
            </View>


            {/* AI 메시지 보기 버튼 - 카메라가 보일 때만 표시 */}
            {isCameraVisible && (
                <View className="absolute top-16 left-6 right-6 z-10">
                    <TouchableOpacity
                        onPress={handleShowAIMessage}
                        activeOpacity={0.7}
                        className="px-6 py-3 rounded-full"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                    >
                        <Text className="text-white text-lg font-medium text-center">
                            AI 메시지 보기
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* AI 질문 섹션 - 화면 위쪽 고정 (카메라가 보일 때는 숨김) */}
            {!isCameraVisible && (
                <AIQuestionSection
                    questionText={currentQuestionText}
                    onQuestionComplete={handleQuestionComplete}
                    isAIResponse={hasAIResponse}
                    onShowCamera={handleShowCamera}
                />
            )}

            {/* 메인 컨텐츠 */}
            <View className="flex-1 p-6">
                {/* 사용자 답변 섹션 - 화면 하단에 고정 */}
                {isQuestionComplete && !isProcessingResponse && (
                    <View className="absolute bottom-6 left-6 right-6">
                        <UserAnswerSection
                            questionId={questionId}
                            microphoneSessionId={microphoneSessionId || null}
                            cameraSessionId={cameraSessionId || null}
                            conversationId={conversationId?.toString() || null}
                            userId={userId || null}
                            onRecordingComplete={handleAnswerRecordingComplete}
                            onRecordingStart={handleAnswerRecordingStart}
                            onAIResponse={handleAIResponse}
                            onEndChat={handleEndChat}
                            transcribedText={transcribedText}
                            isRecording={isRecording}
                            isQuestionComplete={isQuestionComplete}
                            hasAIResponse={hasAIResponse}
                        />
                    </View>
                )}

                {/* AI 상태 메시지 - 마이크 위치에 표시 */}
                <View className="absolute bottom-6 left-6 right-6 items-center">
                    {(() => {
                        let statusMessage = '';
                        if (isProcessingResponse && !hasAIResponse) {
                            statusMessage = '다음말을 생성하고 있어요...';
                        } else if (hasAIResponse && isProcessingResponse && !isQuestionComplete) {
                            statusMessage = 'AI가 말하고 있습니다';
                        }

                        return statusMessage ? (
                            <View className="px-6 py-4 rounded-full" style={{ backgroundColor: '#E8F5E8' }}>
                                <Text className="font-medium text-center text-2xl" style={{ color: colors.green }}>
                                    {statusMessage}
                                </Text>
                            </View>
                        ) : null;
                    })()}
                </View>
            </View>
        </View>
    );
}
