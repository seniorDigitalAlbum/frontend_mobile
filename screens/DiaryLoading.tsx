import { View, Text, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import DiaryLoading from '../components/DiaryLoading';

type Props = NativeStackScreenProps<RootStackParamList, 'DiaryLoading'>;

export default function DiaryLoadingScreen({ route, navigation }: Props) {
    return (
        <SafeAreaView className="flex-1 bg-white justify-center items-center">
            <DiaryLoading />
        </SafeAreaView>
    );
}
