import { View, Text } from 'react-native';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function AlbumCard({ children }: Props) {
    return (
        <View className="w-80 h-96 bg-white rounded-3xl shadow-lg justify-center items-center border border-gray-200">
            <Text className="text-black text-lg font-medium">{children}</Text>
        </View>
    );
}


