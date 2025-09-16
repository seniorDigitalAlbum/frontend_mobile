import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState, useEffect } from 'react';
import DiaryLoading from '../components/DiaryLoading';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { API_BASE_URL } from '../config/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

interface ChatMessage {
    id: number;
    conversationId: number;
    senderType: 'USER' | 'AI';
    content: string;
    timestamp: string;
}

export default function Chat({ route, navigation }: Props) {
    const { settings } = useAccessibility();
    const [isGenerating, setIsGenerating] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 대화 세션 정보 추출
    const conversationId = route.params?.conversationId;
    const userId = "1"; // 하드코딩된 사용자 ID

    // API에서 대화 메시지 가져오기
    useEffect(() => {
        const fetchChatMessages = async () => {
            if (!conversationId) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`);
                if (response.ok) {
                    const messages = await response.json();
                    setChatHistory(messages);
                } else {
                    console.error('Failed to fetch chat messages:', response.status);
                }
            } catch (error) {
                console.error('Error fetching chat messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatMessages();
    }, [conversationId]);

    const handleGenerateDiary = async () => {
        setIsGenerating(true);
        
        try {
            // 백엔드로 데이터 전송 (나중에 구현)
            console.log('백엔드로 데이터 전송 중...');
            
            // 임시로 3초 대기 (실제로는 백엔드 응답 대기)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('일기 생성 완료!');
            
            // 생성된 일기를 DiaryResult 화면으로 전달
            const generatedDiary = `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다. 

햇살이 따뜻하게 비치는 날씨 속에서 우리는 웃음소리를 내며 뛰어다녔고, 서로를 찾는 과정에서 더욱 친해질 수 있었습니다. 

특히 숨는 곳을 찾는 재미와 찾는 사람의 긴장감이 어우러져서 정말 재미있었습니다. 이런 순간들이 모여 오늘 하루를 특별하게 만들어주었어요.

내일도 이런 즐거운 일들이 가득했으면 좋겠습니다.`;
            
            navigation.navigate('DiaryResult', { 
                diary: generatedDiary,
                conversationId,
                finalEmotion: '기쁨', // 임시 감정, 나중에 실제 감정 분석 결과로 교체
                userId
            });
            
        } catch (error) {
            console.error('일기 생성 실패:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // 로딩 중일 때는 로딩 화면 표시
    if (isGenerating || isLoading) {
        return <DiaryLoading />;
    }

    return (
        <SafeAreaView className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
            {/* 채팅 내용 */}
            <ScrollView className={`flex-1 ${settings.isLargeTextMode ? 'px-6 py-6' : 'px-4 py-4'}`}>
                {chatHistory.map((message) => (
                    <View key={message.id} className={`${settings.isLargeTextMode ? 'mb-6' : 'mb-4'} ${message.senderType === 'AI' ? 'items-start' : 'items-end'}`}>
                        {/* AI 메시지 */}
                        {message.senderType === 'AI' && (
                            <View className="flex-row items-end space-x-2">
                                <View className={`${settings.isLargeTextMode ? 'w-10 h-10' : 'w-8 h-8'} bg-blue-100 rounded-full justify-center items-center`}>
                                    <Ionicons name="person" size={settings.isLargeTextMode ? 24 : 20} color="#3B82F6" />
                                </View>
                                <View className={`max-w-[80%] rounded-2xl rounded-bl-md shadow-sm ${settings.isLargeTextMode ? 'p-4' : 'p-3'} ${settings.isHighContrastMode ? 'bg-black border border-white' : 'bg-white'}`}>
                                    <Text className={`${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>{message.content}</Text>
                                    <Text className={`${settings.isLargeTextMode ? 'text-sm' : 'text-xs'} mt-1 ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        {/* 사용자 메시지 */}
                        {message.senderType === 'USER' && (
                            <View className="flex-row items-end space-x-2 justify-end">
                                <View className={`max-w-[80%] rounded-2xl rounded-br-md ${settings.isLargeTextMode ? 'p-4' : 'p-3'} ${settings.isHighContrastMode ? 'bg-white' : 'bg-purple-500'}`}>
                                    <Text className={`${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>{message.content}</Text>
                                    <Text className={`${settings.isLargeTextMode ? 'text-sm' : 'text-xs'} mt-1 ${settings.isHighContrastMode ? 'text-gray-600' : 'text-purple-100'}`}>
                                        {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View className={`${settings.isLargeTextMode ? 'w-10 h-10' : 'w-8 h-8'} bg-purple-100 rounded-full justify-center items-center`}>
                                    <Ionicons name="person" size={settings.isLargeTextMode ? 24 : 20} color="#8B5CF6" />
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* 일기 생성하기 버튼 */}
            <View className={`${settings.isHighContrastMode ? 'bg-black border-white' : 'bg-white border-gray-200'} ${settings.isLargeTextMode ? 'p-8' : 'p-6'} border-t`}>
                <TouchableOpacity
                    onPress={handleGenerateDiary}
                    className={`w-full rounded-2xl items-center shadow-lg ${settings.isLargeTextMode ? 'py-6' : 'py-4'} ${settings.isHighContrastMode ? 'bg-white' : 'bg-purple-500'}`}
                    activeOpacity={0.8}
                    disabled={isGenerating}
                    style={settings.isHighContrastMode ? { borderWidth: 2, borderColor: '#ffffff' } : {}}
                >
                    <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
                        📝 일기 생성하기
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
