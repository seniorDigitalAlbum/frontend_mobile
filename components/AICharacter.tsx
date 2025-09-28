import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AICharacterProps {
    characterType?: 'default' | 'yes' | 'no';
    size?: number;
}

export default function AICharacter({ 
    characterType = 'default', 
    size = 32 
}: AICharacterProps) {
    // 캐릭터 타입에 따른 이미지 경로 매핑
    const getCharacterImage = (type: string) => {
        switch (type) {
            case 'yes':
                return require('../assets/yes.png');
            case 'no':
                return require('../assets/no.png');
            default:
                return require('../assets/character.png');
        }
    };

    return (
        <View 
            className="justify-center items-center overflow-hidden"
            style={{ width: size * 4, height: size * 4 }}
        >
            <Image 
                source={getCharacterImage(characterType)} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
            />
        </View>
    );
} 