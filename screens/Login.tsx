import { View, Image, TouchableOpacity, Text, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        navigation.navigate('MainTabs');
    };

    return (
        <View className="flex-1 gradient-background justify-center items-center px-6">
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
                        로그인
                    </Text>
                    {/* 아이디 입력창 */}
                    <View className="w-full mb-4">
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="아이디를 입력하세요"
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                            className="w-full h-12 bg-white/20 rounded-xl px-4 text-white text-base border border-white/30"
                            style={{
                                color: 'white',
                            }}
                        />
                    </View>
                    
                    {/* 비밀번호 입력창 */}
                    <View className="w-full mb-6">
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="비밀번호를 입력하세요"
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                            secureTextEntry={true}
                            className="w-full h-12 bg-white/20 rounded-xl px-4 text-white text-base border border-white/30"
                            style={{
                                color: 'white',
                            }}
                        />
                    </View>
                    
                    {/* 카카오 로그인 버튼 */}
                    <TouchableOpacity 
                        onPress={handleLogin} 
                        className="w-full h-12 bg-yellow-400 rounded-xl justify-center items-center flex-row shadow-lg"
                    >
                        <Text className="text-black font-semibold text-base">
                            카카오로 로그인
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
