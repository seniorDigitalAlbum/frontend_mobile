import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { UserType } from '../contexts/UserContext';
import UserTypeSelector from '../components/UserTypeSelector';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserRoleSelection } from '../hooks/useUserRoleSelection';

type Props = NativeStackScreenProps<RootStackParamList, 'UserRoleSelection'>;

export default function UserRoleSelection({ route, navigation }: Props) {
    const {
        selectedUserType,
        setSelectedUserType,
        isLoading,
        handleComplete,
        getUserDisplayName
    } = useUserRoleSelection({ route, navigation });

    return (
        <LinearGradient
            colors={gradientColors as [string, string]}
            style={{ flex: 1 }}
        >
            <View className="flex-1 justify-center px-5">
                <Text className="text-3xl font-bold text-center mb-3 text-gray-800">
                    환영합니다!
                </Text>
                <Text className="text-base text-center mb-8 text-gray-600">
                    {getUserDisplayName()}님, 사용자 유형을 선택해주세요
                </Text>

                {/* 사용자 타입 선택 */}
                <View className="mb-8">
                    <UserTypeSelector
                        selectedType={selectedUserType}
                        onTypeSelect={setSelectedUserType}
                    />
                </View>

                {/* 완료 버튼 */}
                <TouchableOpacity
                    className={`w-full h-12 bg-yellow-400 rounded-xl justify-center items-center mt-5 ${
                        !selectedUserType ? 'bg-gray-400' : ''
                    }`}
                    onPress={handleComplete}
                    disabled={!selectedUserType}
                >
                    <Text className="text-black text-base font-semibold">
                        시작하기
                    </Text>
                </TouchableOpacity>

                {/* 로그인 화면으로 돌아가기 */}
                {/* <TouchableOpacity
                    className="mt-5 items-center"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-blue-500 text-sm">
                        다른 방법으로 로그인
                    </Text>
                </TouchableOpacity> */}
            </View>
        </LinearGradient>
    );
}
