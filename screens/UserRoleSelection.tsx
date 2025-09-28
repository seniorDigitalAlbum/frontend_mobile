import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { UserType } from '../contexts/UserContext';
import UserTypeSelector from '../components/UserTypeSelector';
import { purpleGradientColors, lightPurpleGradientColors, colors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserRoleSelection } from '../hooks/useUserRoleSelection';
import { Ionicons } from '@expo/vector-icons';

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
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            <View className="flex-1 justify-center px-6">
                {/* 헤더 섹션 */}
                <View className="items-center mb-12">
                    <Text className="text-4xl font-bold text-center mb-4" style={{ color: colors.darkGreen }}>
                        환영합니다!
                    </Text>
                    {/* {getUserDisplayName()} */}
                    <Text className="text-lg text-center leading-6" style={{ color: colors.darkGreen }}>
                        나림님,{'\n'}사용자 유형을 선택해주세요.
                    </Text>
                </View>

                {/* 사용자 타입 선택 카드 */}
                <View className="mb-10">
                        <UserTypeSelector
                            selectedType={selectedUserType}
                            onTypeSelect={setSelectedUserType}
                        />
                </View>

                {/* 완료 버튼 */}
                <TouchableOpacity
                    className={`w-full h-14 rounded-2xl justify-center items-center shadow-sm ${
                        !selectedUserType ? 'bg-gray-300' : ''
                    }`}
                    onPress={handleComplete}
                    disabled={!selectedUserType}
                    style={{
                        backgroundColor: !selectedUserType ? '#D1D5DB' : 'black',   
                    }}
                >
                    <Text className={`text-lg font-bold ${
                        !selectedUserType ? 'text-gray-500' : 'text-white'
                    }`}>
                        시작하기
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
