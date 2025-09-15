import { View, Image, TouchableOpacity, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        navigation.navigate('MainTabs');
    };

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['#FCF8DD', '#FCF8DD', '#FCF8DD', '#FCF8DD']}
            className="flex-1"
        >
            <View className="flex-1 justify-center items-center px-8 gap-8">
                <Image
                    source={require('../assets/Lock.png')}
                    className="w-1 h-5" />
                <TouchableOpacity onPress={handleLogin} className="items-center shadow-md">
                    <Image
                        source={require('../assets/kakao_login_medium_wide.png')}
                        resizeMode="contain"
                        className="w-64 h-14"
                    />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}
