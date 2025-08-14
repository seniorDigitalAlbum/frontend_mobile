import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 임시 일기 데이터 (나중에 API로 연결)
const generateMockDiaries = () => {
    const diaries = [];
    for (let i = 1; i <= 20; i++) {
        diaries.push({
            id: i,
            title: `오늘은 정말 특별한 하루였어요 #${i}`,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            }),
            preview: `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다...`,
            imageUrl: `https://picsum.photos/200/200?random=${i}`,
            content: `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다. 햇살이 따뜻하게 비치는 날씨 속에서 우리는 웃음소리를 내며 뛰어다녔고, 서로를 찾는 과정에서 더욱 친해질 수 있었습니다.`,
            isPending: false
        });
    }
    return diaries;
};

export default function Album() {
    const { state, setDiaries, getDiaryById } = useDiary();
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<NavigationProp>();

    // 초기 데이터 로드
    useEffect(() => {
        if (state.diaries.length === 0) {
            setDiaries(generateMockDiaries());
        }
    }, []);

    const handleDiaryPress = (diary: any) => {
        // 일기 상세 화면으로 이동
        console.log('일기 선택:', diary.title);
        
        // Context에서 일기 데이터 확인
        const diaryFromContext = getDiaryById(diary.id);
        
        if (diaryFromContext && diaryFromContext.content) {
            // Context에 내용이 있으면 바로 DiaryResult로 이동
            navigation.navigate('DiaryResult', { 
                diary: diaryFromContext.content 
            });
        } else {
            // Context에 내용이 없으면 백엔드에서 조회 (나중에 구현)
            console.log('백엔드에서 일기 상세 정보 조회 필요');
            // TODO: diaryService.getDiary(diary.id) 호출
            // navigation.navigate('DiaryResult', { diary: fetchedDiary.content });
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        // 새로고침 로직 (나중에 API 연동)
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const loadMoreDiaries = useCallback(() => {
        // 무한 스크롤을 위한 추가 데이터 로드 (나중에 API 연동)
        console.log('추가 일기 로드 중...');
    }, []);

    const renderDiaryItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => handleDiaryPress(item)}
            className="flex-1 bg-white rounded-2xl shadow-sm mb-4 mx-2 overflow-hidden"
            activeOpacity={0.8}
        >
            {/* 일기 이미지 */}
            <View className="w-full h-32 bg-gray-200">
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                {/* 저장 중 상태 표시 */}
                {item.isPending && (
                    <View className="absolute top-2 left-2 bg-yellow-500 px-2 py-1 rounded-full">
                        <Text className="text-xs text-white font-medium">저장 중...</Text>
                    </View>
                )}
            </View>
            
            {/* 일기 내용 */}
            <View className="p-4">
                {/* 날짜 */}
                <Text className="text-sm text-gray-500 mb-2">
                    {item.date}
                </Text>
                
                {/* 제목 */}
                <Text className="text-base font-semibold text-gray-800 mb-2 leading-5" numberOfLines={2}>
                    {item.title}
                </Text>
                
                {/* 미리보기 */}
                <Text className="text-sm text-gray-600 leading-4" numberOfLines={2}>
                    {item.preview}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 일기 목록 */}
            <FlatList
                data={state.diaries}
                renderItem={renderDiaryItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ListHeaderComponent={
                    <View className="px-4 py-6">
                        <Text className="text-2xl font-bold text-gray-800 mb-2">
                            나의 일기장
                        </Text>
                        <Text className="text-gray-600">
                            특별한 순간들을 담은 일기들을 확인해보세요
                        </Text>
                    </View>
                }
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onEndReached={loadMoreDiaries}
                onEndReachedThreshold={0.1}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
