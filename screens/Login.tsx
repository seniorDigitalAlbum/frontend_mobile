import { View, Image, TouchableOpacity, Text, Linking, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
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
        <View 
            style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                paddingHorizontal: 24,
                backgroundColor: colors.green
            }}
        >
            <StatusBar barStyle="light-content" backgroundColor={colors.green} />
            <View className="items-center w-full px-8">
                {/* 로고 */}
                <Image
                    source={require('../assets/logo_white.png')}
                    resizeMode="cover"
                    style={{
                        width: 300,
                        height: 300,
                    }}
                    className="mb-12"
                />
                
                {/* 테스트 로그인 버튼 */}
                <TouchableOpacity 
                    onPress={handleTestLogin} 
                    className="w-full h-14 rounded-2xl justify-center items-center flex-row shadow-lg"
                    style={{
                        backgroundColor: colors.darkGreen,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <Text className="text-white font-bold text-lg">
                        카카오로 시작하기
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
