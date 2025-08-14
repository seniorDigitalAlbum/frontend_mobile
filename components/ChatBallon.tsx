import { View, Text } from 'react-native';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function ChatBallon({ children }: Props) {
    return (
        <View className="h-20 w-full border border-gray1 rounded-xl justify-center items-center px-4 mt-2">
            <Text className="text-black">{children}</Text>
        </View>

    );
}
