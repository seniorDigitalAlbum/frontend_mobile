import { View, Image, TouchableOpacity, Text, Linking, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import kakaoAuthService from '../services/kakaoAuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation: propNavigation }: Props) {
    const navigation = useNavigation<any>();

    const handleKakaoLogin = async () => {
        try {
            console.log('카카오 로그인 시작');
            
            // 백엔드에서 카카오 로그인 URL 가져오기
            const authUrl = await kakaoAuthService.getKakaoAuthUrl();
            console.log('카카오 로그인 URL:', authUrl);
            
            // 카카오 로그인 페이지로 이동
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

    const handleTestLogin = () => {
        console.log('테스트 로그인 시작');
        
        // 사용자 역할 선택 화면으로 바로 이동
        navigation.navigate('UserRoleSelection');
    };


    return (
        <LinearGradient
            colors={gradientColors as [string, string]}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
            <View className="w-full h-1/2 glass-effect rounded-3xl justify-center items-center relative">
                {/* 상단 하이라이트 라인 */}
                <View className="absolute top-0 left-0 right-0 h-px glass-highlight-top" />

                {/* 왼쪽 하이라이트 라인 */}
                <View className="absolute top-0 left-0 bottom-0 w-px glass-highlight-left" />

                <View className="items-center w-full px-8">
                    {/* 로고 */}
                    {/* <Image
                        source={require('../assets/logo_white.png')}
                        resizeMode="contain"
                        style={{
                            width: 200,
                            height: 200,
                        }}
                        className="mb-8"
                    /> */}
                    <Text className="text-4xl font-bold text-white bottom-10">
                        시작하기
                    </Text>
                    

                    {/* 카카오 로그인 버튼 */}
                    <TouchableOpacity 
                        onPress={handleKakaoLogin} 
                        className="w-full h-12 bg-yellow-400 rounded-xl justify-center items-center flex-row shadow-lg mb-4"
                    >
                        <Text className="text-black font-semibold text-base">
                            카카오로 시작하기
                        </Text>
                    </TouchableOpacity>

                    {/* 테스트 로그인 버튼 */}
                    <TouchableOpacity 
                        onPress={handleTestLogin} 
                        className="w-full h-12 bg-blue-500 rounded-xl justify-center items-center flex-row shadow-lg"
                    >
                        <Text className="text-white font-semibold text-base">
                            테스트 로그인
                        </Text>
                    </TouchableOpacity>
                    
                 </View>
            </View>
        </LinearGradient>
    );
}
