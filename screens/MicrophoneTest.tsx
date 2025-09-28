import { View, Text, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Ionicons } from '@expo/vector-icons';
import AICharacter from '../components/AICharacter';
import { useMicrophoneTest } from '../hooks/useMicrophoneTest';
import { MicrophoneTestUtils } from '../utils/microphoneTestUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'MicrophoneTest'>;

export default function MicrophoneTest({ route, navigation }: Props) {
    // 커스텀 훅으로 상태와 로직 분리
    const { 
        isMicTested,
        isRecording,
        audioLevel,
        speechBubbleText,
        sttResult,
        userId,
        audioLevelAnimation,
        handleStart,
        startMicTest,
        canStart,
    } = useMicrophoneTest(route.params);

    return (
        <SafeAreaView className="flex-1 bg-gray-800">
            {/* AI 캐릭터와 말풍선 */}
            <View className="absolute top-16 -left-2 z-10" style={{ maxWidth: '95%' }}>
                <View className="flex-row items-start">
                    <AICharacter />
                    
                    {/* 말풍선 */}
                    <View className="mt-6 -ml-1" style={{ maxWidth: 250, minHeight: 60 }}>
                        <View 
                            className="rounded-2xl px-4 py-3 shadow-lg"
                            style={{ 
                                backgroundColor: '#FFFFFF',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                minHeight: 50
                            }}
                        >
                            <Text 
                                className="text-gray-800 text-2xl font-medium leading-8"
                                numberOfLines={0}
                                adjustsFontSizeToFit={true}
                                minimumFontScale={0.8}
                            >
                                {speechBubbleText}
                </Text>
            </View>
                        {/* 말풍선 꼬리 */}
                        <View 
                            className="absolute -left-2 top-4 w-0 h-0"
                            style={{
                                borderTopWidth: 8,
                                borderBottomWidth: 8,
                                borderRightWidth: 12,
                                borderTopColor: 'transparent',
                                borderBottomColor: 'transparent',
                                borderRightColor: '#FFFFFF',
                            }}
                        />
                    </View>
                </View>
            </View>

            {/* 메인 컨텐츠 */}
            <View className="flex-1 justify-center items-center px-6">
                {/* 마이크 아이콘 - 화면 중앙에 크게 */}
                <View className="items-center mb-8" style={{ height: 200, marginTop: 60 }}>
                    <TouchableOpacity 
                        onPress={startMicTest}
                        disabled={isRecording || isMicTested}
                        className={`w-48 h-48 rounded-full justify-center items-center ${
                            isMicTested ? '' : MicrophoneTestUtils.getBackgroundColor(isRecording, isMicTested) as string
                        }`}
                        style={isMicTested ? MicrophoneTestUtils.getBackgroundColor(isRecording, isMicTested) as { backgroundColor: string } : undefined}
                        activeOpacity={0.7}
                    >
                        <View className="w-24 h-24 justify-center items-center">
                        <Ionicons 
                                name={MicrophoneTestUtils.getIconName(isRecording, isMicTested) as any} 
                                size={100} 
                                color={MicrophoneTestUtils.getIconColor(isRecording, isMicTested)} 
                            />
                        </View>
                        
                        {/* 실시간 오디오 레벨 표시 */}
                        {isRecording && (
                            <View className="absolute -bottom-20 left-0 right-0 items-center">
                                <View className="flex-row items-end space-x-3 h-16">
                                    {[...Array(5)].map((_, index) => (
                                        <Animated.View
                                            key={index}
                                            className="w-3 bg-red-500 rounded-full"
                                            style={{
                                                height: audioLevelAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [12, 64],
                                                }),
                                                opacity: audioLevelAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.3, 1],
                                                }),
                                            }}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                    
                    {isRecording && (
                        <Text className="text-lg text-red-400 mt-2">
                            녹음 중... 듣고 있습니다
                        </Text>
                    )}

                </View>
                <View className="items-center" style={{ height: 80 }}>
                {isMicTested && (
                        <TouchableOpacity
                        onPress={handleStart}
                            className="px-12 py-4 rounded-full"
                            style={MicrophoneTestUtils.getStartButtonColor()}
                        >
                            <Text className="text-white text-2xl font-bold">시작하기</Text>
                        </TouchableOpacity>
                )}
                </View>
            </View>
        </SafeAreaView>
    );
}
