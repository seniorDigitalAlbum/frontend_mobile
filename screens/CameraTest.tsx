import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { useCameraTest } from '../hooks/useCameraTest';
import AICharacter from '../components/AICharacter';
import HiddenCamera from '../components/HiddenCamera';
import { colors } from '../styles/commonStyles';
import { useState, useEffect } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraTest'>;

export default function CameraTest({ route, navigation }: Props) {
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [emotionData, setEmotionData] = useState<any>(null);
    const [faceDetectionCount, setFaceDetectionCount] = useState(0); // 연속 얼굴 인식 카운터
    
    // 커스텀 훅으로 상태와 로직 분리
    const { 
        isMicTested,
        isCameraReady,
        canStart,
        userId,
        handleStart,
        handleMicTest,
        handleCameraReady,
        // 카메라 상태
        permission,
        requestPermission,
        facing,
        flash,
        zoom,
        cameraHeight,
        // 카메라 함수
        switchCamera,
        toggleFlash,
    } = useCameraTest(route.params);


    // 권한이 없을 때
    if (!permission || permission.status !== "granted") {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="bg-gray-300 flex-1 justify-center items-center">
                    <Text className="text-gray-600 text-2xl font-medium">카메라 권한이 필요합니다.</Text>
                    <TouchableOpacity onPress={requestPermission} className="px-8 py-4 bg-blue-500 rounded-lg mt-6">
                        <Text className="text-white text-xl font-bold">권한 요청</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* 헤더 - 질문 내용 */}
            <View className="p-6 border-b border-gray-200 bg-white">
                <Text className="text-2xl font-bold text-center text-black leading-8">
                    카메라와 마이크를 테스트할게요.
                </Text>
            </View>

            {/* 카메라 뷰 */}
            <View className="bg-black flex-1">
                {/* HiddenCamera를 보이는 모드로 사용 */}
                <HiddenCamera
                    isVisible={true}
                    isTestMode={true}
                    onTestFaceDetected={(faceDetected, emotionData) => {
                        console.log('📸 CameraTest - YOLO 응답:', emotionData);
                        console.log('📸 CameraTest - 얼굴 인식 여부:', faceDetected);
                        
                        setEmotionData(emotionData);
                        setIsDetecting(true);
                        
                        // 3번 연속으로 non-neutral 값을 받았을 때만 얼굴 인식 성공으로 처리
                        if (emotionData?.emotion && emotionData.emotion !== 'neutral') {
                            const newCount = faceDetectionCount + 1;
                            setFaceDetectionCount(newCount);
                            
                            console.log(`📸 CameraTest - 연속 얼굴 인식 카운트: ${newCount}/3`);
                            
                            if (newCount >= 3) {
                                setIsFaceDetected(true);
                                console.log('📸 CameraTest - 얼굴 인식 성공! (3번 연속)');
                            }
                        } else {
                            // neutral이거나 실패한 경우 카운터 리셋
                            setFaceDetectionCount(0);
                            setIsFaceDetected(false);
                            console.log('📸 CameraTest - 얼굴 인식 카운터 리셋');
                        }
                    }}
                />

                {/* 불투명 오버레이 - 화면 전체를 꽉 채움 */}
                <View 
                    className="absolute bg-black/20 justify-center items-center"
                    style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                    }}
                    pointerEvents="auto" // 터치 항상 활성화
                >
                    {/* AI 캐릭터와 가이드 메시지 */}
                    <View className="flex-1 justify-center items-center px-6">
                        {/* 캐릭터와 메시지 컨텐츠 */}
                        <View className="items-center">
                            {/* 캐릭터 */}
                            <AICharacter 
                                characterType={isFaceDetected ? 'yes' : 'no'} 
                                size={35}
                            />
                            
                            {/* 얼굴 인식 상태에 따른 메시지 */}
                            {isDetecting && !isFaceDetected && (
                                <>
                                    <Text className="text-white text-3xl font-medium text-center px-8 leading-9 mt-6">
                                        얼굴이 잘 안보여요
                                    </Text>
                                    <Text className="text-white/80 text-lg text-center px-8 mt-4 leading-7">
                                        카메라에 얼굴이 잘 보이도록 해주세요
                                    </Text>
                                    <View className="mt-6 flex-row items-center">
                                        <View className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse mr-3" />
                                        <Text className="text-yellow-400 text-lg">
                                            {faceDetectionCount > 0 
                                                ? `얼굴을 인식하고 있어요... (${faceDetectionCount}/3)`
                                                : '얼굴을 찾고 있어요...'
                                            }
                                        </Text>
                                    </View>
                                </>
                            )}
                            
                            {isFaceDetected && (
                                <>
                                    <Text className="text-white text-3xl font-medium text-center px-8 leading-9 mt-6">
                                        잘 보이네요!
                                    </Text>
                                    
                                    {/* 다음 버튼 */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            // 마이크 테스트 화면으로 이동
                                            navigation.navigate('MicrophoneTest', {
                                                questionText: route.params?.questionText,
                                                questionId: route.params?.questionId,
                                                conversationId: route.params?.conversationId,
                                                cameraSessionId: route.params?.cameraSessionId,
                                                microphoneSessionId: route.params?.microphoneSessionId,
                                            });
                                        }}
                                        className="px-12 py-4 rounded-full mt-8"
                                        style={{backgroundColor: colors.green}}
                                    >
                                        <Text className="text-white text-2xl font-bold">다음</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                        
                        {/* 빨간색 스트로크 원 - z-index로 뒤에 배치 */}
                        {isFaceDetected && (
                            <View 
                                className="absolute rounded-full border-8 border-red-500"
                                style={{
                                    width: 350,
                                    height: 350,
                                    zIndex: -1, // 뒤에 배치
                                }}
                            />
                        )}
                    </View>
                </View>

                {/* 카메라 컨트롤 오버레이 */}
                <View className="absolute bottom-4 right-4">
                    {/* 카메라 전환 */}
                    <TouchableOpacity
                        onPress={switchCamera}
                        className="w-12 h-12 bg-black/50 rounded-full justify-center items-center"
                    >
                        <Ionicons name="camera-reverse" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
