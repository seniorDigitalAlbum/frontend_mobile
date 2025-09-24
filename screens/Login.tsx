import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import kakaoAuthService from '../services/kakaoAuthService';

export default function Login() {
    const navigation = useNavigation<any>();

    const handleKakaoLogin = async () => {
        try {
            const authUrl = await kakaoAuthService.getKakaoAuthUrl();
            const supported = await Linking.canOpenURL(authUrl);
            if (supported) {
                await Linking.openURL(authUrl);
            } else {
                Alert.alert('오류', '카카오 로그인을 실행할 수 없습니다.');
            }
        } catch (error) {
            console.error('카카오 로그인 실패:', error);
            Alert.alert('오류', '카카오 로그인을 시작할 수 없습니다.');
        }
    };

    return (
        <LinearGradient
            colors={gradientColors as [string, string]}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
            <View className="w-full h-1/2 glass-effect rounded-3xl justify-center items-center relative">
                <View className="absolute top-0 left-0 right-0 h-px glass-highlight-top" />
                <View className="absolute top-0 left-0 bottom-0 w-px glass-highlight-left" />
                <View className="items-center w-full px-8">
                    <Text className="text-4xl font-bold text-white bottom-10">
                        시작하기
                    </Text>
                    <TouchableOpacity
                        onPress={handleKakaoLogin}
                        className="w-full h-12 bg-yellow-400 rounded-xl justify-center items-center flex-row shadow-lg mb-4"
                    >
                        <Text className="text-black font-semibold text-base">
                            카카오로 시작하기
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}