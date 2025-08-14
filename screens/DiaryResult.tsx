import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useDiary } from '../contexts/DiaryContext';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'DiaryResult'>;

export default function DiaryResult({ route }: Props) {
    const { diary } = route.params || { diary: '일기가 생성되지 않았습니다.' };
    const { addDiary, updateDiary, removeDiary } = useDiary();
    const navigation = useNavigation();

    const handleSaveDiary = async () => {
        // 임시 일기 데이터 생성 (프론트엔드에 즉시 추가)
        const tempDiary = {
            id: Date.now(), // 임시 ID
            title: '오늘은 정말 특별한 하루였어요',
            date: new Date().toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            }),
            preview: diary.substring(0, 100) + '...',
            imageUrl: 'https://picsum.photos/200/200?random=' + Date.now(),
            content: diary, // 일기 전체 내용 저장
            isPending: true, // 백엔드 저장 중 상태
        };

        // 프론트엔드에 즉시 추가 (Optimistic Update)
        addDiary(tempDiary);

        try {
            // 백엔드로 저장 (나중에 실제 API 연동)
            console.log('백엔드로 일기 저장 중...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기 시뮬레이션

            // 저장 성공 시 임시 데이터를 실제 데이터로 교체
            const savedDiary = {
                ...tempDiary,
                isPending: false, // 저장 완료 상태
            };
            updateDiary(tempDiary.id, savedDiary);

            console.log('일기 저장 완료!');
            
            // 앨범 페이지로 이동하면서 저장된 일기 정보 전달
            navigation.reset({
                index: 0,
                routes: [
                    { 
                        name: 'MainTabs' as never,
                        params: { 
                            screen: 'Album' as never,
                            // 앨범에서 일기 클릭 시 DiaryResult로 이동할 수 있도록
                            // 일기 데이터를 전역 상태에 저장해둠
                        }
                    }
                ],
            });
        } catch (error) {
            console.error('일기 저장 실패:', error);
            
            // 실패 시 임시 데이터 제거
            removeDiary(tempDiary.id);
            
            // 에러 처리 (나중에 사용자에게 알림)
            alert('일기 저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleBackToHome = () => {
        // 홈으로 돌아가기
        navigation.navigate('MainTabs' as never);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* 상단 감정 이모티콘 */}
                <View className="items-center pt-12 pb-6">
                    <View className="w-24 h-24 bg-yellow-100 rounded-full justify-center items-center mb-4">
                        <Text className="text-4xl">😊</Text>
                    </View>
                </View>

                {/* 제목 */}
                <View className="items-center mb-6">
                    <Text className="text-2xl font-bold text-gray-800">
                        오늘의 일기
                    </Text>
                </View>

                {/* 구분선 */}
                <View className="mx-6 mb-8">
                    <View className="h-px bg-gray-200" />
                </View>

                {/* 일기 내용 */}
                <View className="px-6 mb-8">
                    <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <Text className="text-lg text-gray-700 leading-7">
                            {diary}
                        </Text>
                    </View>
                </View>

                {/* 버튼들 */}
                <View className="px-6 mb-8 space-y-4">
                    <TouchableOpacity
                        onPress={handleSaveDiary}
                        className="w-full bg-green-500 py-4 rounded-2xl items-center shadow-lg"
                        activeOpacity={0.8}
                    >
                        <Text className="text-lg font-semibold text-white">
                            💾 일기 저장하기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log('일기 공유하기')}
                        className="w-full bg-blue-500 py-4 rounded-2xl items-center shadow-lg"
                        activeOpacity={0.8}
                    >
                        <Text className="text-lg font-semibold text-white">
                            📤 일기 공유하기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleBackToHome}
                        className="w-full bg-purple-500 py-4 rounded-2xl items-center shadow-lg"
                        activeOpacity={0.8}
                    >
                        <Text className="text-lg font-semibold text-white">
                            🏠 홈으로 돌아가기
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 