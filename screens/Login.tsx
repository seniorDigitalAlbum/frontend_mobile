import { View, Image, TouchableOpacity, Text, Linking, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { colors, whiteToGreenGradientColors } from '../styles/commonStyles';
import kakaoAuthService from '../services/kakaoAuthService';
import { LinearGradient } from 'expo-linear-gradient';

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
            colors={[...whiteToGreenGradientColors].reverse()} // 색상 순서 반전
            locations={[0, 0.9]}
            style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                paddingHorizontal: 24,
            }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View className="flex-1 items-center w-full px-6 py-20">
                {/* 상단 영역 */}
                <View className="items-center mb-20">
                    {/* 로고 */}
                    <Image
                        source={require('../assets/logo_white.png')}
                        resizeMode="cover"
                        style={{
                            width: 300,
                            height: 300,
                        }}
                    />
                </View>
                
                {/* 텍스트 영역 */}
                <View className="w-full mb-10">
                     <Text 
                         className="text-5xl font-bold text-left"
                         style={{ 
                             lineHeight: 60,
                             color: '#67876C'
                         }}
                     >
                        당신의{'\n'}오래된{'\n'}이야기
                    </Text>
                </View>
                
                {/* 카카오 로그인 버튼 */}
                <TouchableOpacity 
                    onPress={handleTestLogin} 
                    className="w-full h-16 bg-black rounded-2xl justify-center items-center flex-row overflow-hidden"
                >

                    <Text className="text-lg font-bold text-left" style={{ color: 'white' }}>카카오 로그인</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}