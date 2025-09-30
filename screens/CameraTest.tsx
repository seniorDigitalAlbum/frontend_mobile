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
    const [isTestComplete, setIsTestComplete] = useState(false); // 테스트 완료 상태
    
    // 얼굴이 앱 화면 영역 내에 있는지 확인하는 함수
    const isFaceInAppArea = (x1: number, y1: number, x2: number, y2: number) => {
        // 웹캠 해상도 (일반적으로 640x480 또는 1280x720)
        const webcamWidth = 640;
        const webcamHeight = 480;
        
        // 앱 화면 영역 (웹캠 좌표 기준)
        // 화면 중앙 60% 영역만 유효한 얼굴 인식 영역으로 설정
        const appAreaMarginX = webcamWidth * 0.2; // 좌우 20% 마진
        const appAreaMarginY = webcamHeight * 0.2; // 상하 20% 마진
        
        const appAreaX1 = appAreaMarginX;
        const appAreaY1 = appAreaMarginY;
        const appAreaX2 = webcamWidth - appAreaMarginX;
        const appAreaY2 = webcamHeight - appAreaMarginY;
        
        // 얼굴이 앱 영역 내에 있는지 확인
        const isInArea = x1 >= appAreaX1 && y1 >= appAreaY1 && x2 <= appAreaX2 && y2 <= appAreaY2;
        
        return isInArea;
    };
    
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
                    isTestComplete={isTestComplete}
                    onTestFaceDetected={(faceDetected, emotionData) => {
                        // YOLO 응답에서 좌표값 출력 (앱 영역 내에서만)
                        let isInAppArea = true; // 기본값으로 true 설정
                        if (emotionData?.data?.bounding_box) {
                            const [x1, y1, x2, y2] = emotionData.data.bounding_box;
                            const isNoDetection = emotionData?.emotion === 'no detections' || emotionData?.emotion === 'neutral' || !emotionData?.emotion;
                            
                            // 앱 화면 영역 내에서만 얼굴 인식으로 처리
                            // YOLO 좌표는 전체 웹캠 영역 기준이므로, 앱 화면 영역과 비교
                            isInAppArea = isFaceInAppArea(x1, y1, x2, y2);
                            
                            // 앱 영역 내에서만 콘솔 출력
                            if (isInAppArea) {
                                const status = isNoDetection ? '얼굴이 인식되지 않음' : '얼굴이 인식됨';
                                console.log(`인식된 얼굴 좌표 : (${x1}, ${y1}, ${x2}, ${y2}) - ${status}`);
                            }
                        }
                        
                        setEmotionData(emotionData);
                        setIsDetecting(true);
                        
                        // 3번 연속으로 non-neutral, non-no detections 값을 받았을 때만 얼굴 인식 성공으로 처리
                        // 단, 앱 영역 내에서만 인식된 경우만 성공으로 처리
                        if (emotionData?.emotion && emotionData.emotion !== 'neutral' && emotionData.emotion !== 'no detections' && isInAppArea) {
                            const newCount = faceDetectionCount + 1;
                            setFaceDetectionCount(newCount);
                            
                            if (newCount >= 3) {
                                setIsFaceDetected(true);
                                setIsTestComplete(true); // 테스트 완료 상태로 설정
                            }
                        } else {
                            // neutral, no detections이거나 앱 영역 외부인 경우 카운터 리셋
                            setFaceDetectionCount(0);
                            setIsFaceDetected(false);
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
                                    <Text className="text-white/80 text-xl text-center px-8 mt-4 leading-7">
                                        카메라에 얼굴이 잘 보이도록 해주세요
                                    </Text>
                                    <View className="mt-6 flex-row items-center">
                                        <View className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse mr-3" />
                                        <Text className="text-yellow-400 text-xl">
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


