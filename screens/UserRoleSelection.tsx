import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { UserType, useUser } from '../contexts/UserContext';
import UserTypeSelector from '../components/UserTypeSelector';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

type UserRoleSelectionRouteProp = RouteProp<RootStackParamList, 'UserRoleSelection'>;
type UserRoleSelectionNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function UserRoleSelection() {
    const { login } = useUser();
    const route = useRoute<UserRoleSelectionRouteProp>();
    const navigation = useNavigation<UserRoleSelectionNavigationProp>();
    
    const [isLoading, setIsLoading] = useState(true);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string | null>(null);
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

    useEffect(() => {
        const { token, nickname: encodedNickname, isNewUser, error } = route.params || {};

        if (error) {
            Alert.alert('로그인 오류', '로그인 과정 중 문제가 발생했습니다.');
            navigation.navigate('Login');
            return;
        }

        if (token && encodedNickname) {
            const decodedNickname = decodeURIComponent(encodedNickname);
            setJwtToken(token);
            setNickname(decodedNickname);

            if (isNewUser === 'false') {
                const loginUserData = { token, name: decodedNickname, userType: null };
                login(loginUserData as any).then(() => {
                    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
                });
            } else {
                setIsLoading(false);
            }
        } else {
            // 이 화면은 로그인 직후에만 들어오므로, token이 없다면 비정상적인 접근
            Alert.alert('오류', '인증 정보가 올바르지 않습니다.');
            navigation.navigate('Login');
        }
    }, [route.params]);

    const handleComplete = async () => {
        if (!selectedUserType || !jwtToken) {
            Alert.alert('오류', '사용자 유형을 선택해주세요.');
            return;
        }
        
        try {
            setIsLoading(true);
            
            // TODO: 백엔드에 사용자 역할(userType) 업데이트 API 호출
            // apiClient.post('/api/users/update-type', { userType: selectedUserType });
            
            const loginUserData = {
                token: jwtToken,
                name: nickname,
                userType: selectedUserType,
            };
            await login(loginUserData as any);

            if (selectedUserType === UserType.GUARDIAN) {
                navigation.navigate('GuardianConnection');
            } else {
                navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
            }
        } catch (err: any) {
            console.error('가입 처리 실패:', err);
            Alert.alert('오류', '가입 처리 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
    };
    
    if (isLoading) {
        return (
            <LinearGradient colors={gradientColors as [string, string]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={gradientColors as [string, string]} style={{ flex: 1 }}>
            <View className="flex-1 justify-center px-5">
                <Text className="text-3xl font-bold text-center mb-3 text-gray-800">
                    환영합니다!
                </Text>
                <Text className="text-base text-center mb-8 text-gray-600">
                    {nickname}님, 사용자 유형을 선택해주세요
                </Text>
                <View className="mb-8">
                    <UserTypeSelector
                        selectedType={selectedUserType}
                        onTypeSelect={setSelectedUserType}
                    />
                </View>
                <TouchableOpacity
                    className={`w-full h-12 bg-yellow-400 rounded-xl justify-center items-center mt-5 ${!selectedUserType ? 'opacity-50' : ''}`}
                    onPress={handleComplete}
                    disabled={!selectedUserType || isLoading}
                >
                    <Text className="text-black text-base font-semibold">시작하기</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}