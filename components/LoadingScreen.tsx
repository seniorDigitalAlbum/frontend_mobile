import { View, Text } from 'react-native';

interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = "로딩 중..." }: LoadingScreenProps) {
    return (
        <View className="flex-1 bg-white justify-center items-center">
            <Text className="text-gray-500">{message}</Text>
        </View>
    );
}
