import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
import { SeniorInfo } from '../services/guardianService';
import { useUser } from '../contexts/UserContext';
import guardianService from '../services/guardianService';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianConnectionResult'>;

interface GuardianConnectionResultProps {
    seniors: SeniorInfo[];
    selectedSeniors: SeniorInfo[];
    onSeniorToggle: (senior: SeniorInfo) => void;
    onConnect: () => void;
    onBack: () => void;
    isConnecting: boolean;
}

export default function GuardianConnectionResult({ 
    navigation, 
    route 
}: Props) {
    const { 
        seniors, 
        selectedSeniors, 
        onSeniorToggle, 
        onConnect, 
        onBack, 
        isConnecting 
    } = route.params;
    
    const { user, updateUser } = useUser();
    const [selectedSenior, setSelectedSenior] = useState<SeniorInfo | null>(null);
    
    // 컴포넌트 마운트 시 첫 번째 시니어를 자동으로 선택
    useEffect(() => {
        console.log('🔗 GuardianConnectionResult 마운트됨');
        console.log('🔗 받은 seniors:', seniors);
        console.log('🔗 받은 selectedSeniors:', selectedSeniors);
        
        // 첫 번째 시니어를 자동으로 선택 (검색된 시니어는 무조건 한 명)
        if (seniors && seniors.length > 0) {
            setSelectedSenior(seniors[0]);
            console.log('🔗 선택된 시니어:', seniors[0]);
        }
    }, [seniors]);

    return (
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            <ScrollView className="flex-1">
                <View className="flex-1 px-6 pt-20">
                    {/* 헤더 섹션 */}
                    <View className="items-center m-8">
                        <Text className="text-4xl font-bold text-center mb-4 text-black">
                            검색 결과
                        </Text>
                        <Text className="text-lg text-center leading-6 mb-4 text-black">
                            정보를 확인해주세요.
                        </Text>
                        <Text className="text-base text-center leading-6 text-gray1">
                            연결하기 후 시니어가 수락하면 앨범을 볼 수 있어요.
                        </Text>
                    </View>

                    {/* 시니어 정보 */}
                    <View className="mb-8">
                        {selectedSenior && (
                            <View 
                                className="rounded-2xl m-5 p-10 shadow-sm mb-4"
                                style={{
                                    backgroundColor: colors.beige,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <View className="flex justify-center items-center gap-4">
                                    {/* 프로필 이미지 */}
                                    <View className="w-32 h-32 rounded-full bg-white items-center justify-center shadow-sm overflow-hidden">
                                        {selectedSenior.profileImage && selectedSenior.profileImage.trim() !== '' ? (
                                            <Image 
                                                source={{ uri: selectedSenior.profileImage }}
                                                className="w-32 h-32"
                                                resizeMode="cover"
                                                onError={(error) => {
                                                    console.log('이미지 로딩 실패, 기본 이미지 사용:', error.nativeEvent.error);
                                                }}
                                                onLoad={() => {
                                                    console.log('이미지 로딩 성공:', selectedSenior.profileImage);
                                                }}
                                            />
                                        ) : (
                                            <Image 
                                                source={require('../assets/character.png')}
                                                className="w-32 h-32"
                                                resizeMode="cover"
                                            />
                                        )}
                                    </View>
                                    
                                    {/* 사용자 정보 */}
                                    <View className="flex">
                                        <Text className="text-4xl font-bold mb-2" style={{ color: colors.darkGreen }}>
                                            {selectedSenior.name}
                                        </Text>
                                        <Text className="text-base" style={{ color: colors.darkGreen }}>
                                            {selectedSenior.phoneNumber || '전화번호 없음'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* 연결 버튼 */}
                    <TouchableOpacity
                        className="m-5 h-14 rounded-2xl justify-center items-center mb-4"
                        onPress={async () => {
                            console.log('🔗 연결 버튼 클릭됨');
                            
                            if (!user?.id) {
                                alert('사용자 정보를 찾을 수 없습니다.');
                                return;
                            }

                            if (!selectedSenior) {
                                alert('연결할 시니어가 없습니다.');
                                return;
                            }
                            
                            try {
                                console.log(`🔗 ${selectedSenior.name}와 연결하기 시작`);
                                
                                // 선택된 시니어와 연결하기
                                const result = await guardianService.connectSenior(
                                    parseInt(user.id), 
                                    selectedSenior.id
                                );

                                console.log('🔗 연결 결과:', result);

                                if (result.success) {
                                    // 보호자 역할 업데이트
                                    const { UserType } = await import('../contexts/UserContext');
                                    await updateUser({ userType: UserType.GUARDIAN });
                                    
                                    alert(`${selectedSenior.name}님과 연결하기가 전송되었습니다.\n시니어의 승인을 기다려주세요.`);
                                    
                                    // 연결 요청 후 GuardianMain으로 이동
                                    navigation.navigate('GuardianMain');
                                } else {
                                    alert('연결하기에 실패했습니다. 다시 시도해주세요.');
                                }
                            } catch (error) {
                                console.error('시니어 연결 실패:', error);
                                alert('연결하기 중 오류가 발생했습니다. 다시 시도해주세요.');
                            }
                        }}
                        disabled={isConnecting}
                        style={{
                            backgroundColor: isConnecting ? '#D1D5DB' : 'black',
                        }}
                    >
                        <Text className={`text-lg font-bold ${
                            isConnecting ? 'text-gray-500' : 'text-white'
                        }`}>
                            {isConnecting ? '연결 중...' : '연결하기'}
                        </Text>
                    </TouchableOpacity>

                    {/* 뒤로가기 버튼 */}
                    <TouchableOpacity
                        className="mx-5 h-14 rounded-2xl justify-center items-center"
                        onPress={onBack}
                        disabled={isConnecting}
                        style={{
                            backgroundColor: '#D1D5DB'
                        }}
                    >
                        <Text className="text-lg font-bold text-gray-500">
                            다시 검색하기
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}
