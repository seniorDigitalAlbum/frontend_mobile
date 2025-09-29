import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
import { SeniorInfo } from '../services/guardianService';

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

    return (
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            <ScrollView className="flex-1">
                <View className="flex-1 px-6 pt-20">
                    {/* 헤더 섹션 */}
                    <View className="items-center m-8">
                        <Text className="text-4xl font-bold text-center mb-4" style={{ color: colors.darkGreen }}>
                            검색 결과
                        </Text>
                        <Text className="text-lg text-center leading-6" style={{ color: colors.darkGreen }}>
                            정보를 확인해주세요.
                        </Text>
                    </View>

                    {/* 시니어 정보 */}
                    <View className="mb-8">
                        {seniors.map((senior) => (
                            <View 
                                key={senior.id}
                                className="rounded-2xl p-5 shadow-sm mb-4"
                                style={{
                                    backgroundColor: colors.beige,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <View className="flex justify-start gap-4">
                                    {/* 프로필 이미지 */}
                                    <View className="w-32 h-32 rounded-full bg-white mr-4 items-center justify-center shadow-sm overflow-hidden">
                                        {senior.profileImage && senior.profileImage.trim() !== '' ? (
                                            <Image 
                                                source={{ uri: senior.profileImage }}
                                                className="w-32 h-32"
                                                resizeMode="cover"
                                                onError={(error) => {
                                                    console.log('이미지 로딩 실패, 기본 이미지 사용:', error.nativeEvent.error);
                                                }}
                                                onLoad={() => {
                                                    console.log('이미지 로딩 성공:', senior.profileImage);
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
                                    <View className="flex justify-center items-center">
                                        <Text className="text-4xl font-bold mb-2" style={{ color: colors.darkGreen }}>
                                            {senior.name}
                                        </Text>
                                        <Text className="text-base" style={{ color: colors.darkGreen }}>
                                            {senior.phoneNumber || '전화번호 없음'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* 연결 버튼 */}
                    <TouchableOpacity
                        className="w-full h-14 rounded-2xl justify-center items-center mb-4"
                        onPress={onConnect}
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
                        className="w-full h-14 rounded-2xl justify-center items-center"
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
