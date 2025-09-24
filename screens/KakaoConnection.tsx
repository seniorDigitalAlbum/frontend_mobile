import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'KakaoConnection'>;

// 더미 시니어 데이터
const dummySeniors = [
    {
        id: 1,
        name: '김할머니',
        phoneNumber: '010-1111-2222',
        gender: 'FEMALE',
        joinDate: '2024.01.15',
        profileImage: null
    },
    {
        id: 2,
        name: '박할아버지',
        phoneNumber: '010-3333-4444',
        gender: 'MALE',
        joinDate: '2024.02.20',
        profileImage: null
    },
    {
        id: 3,
        name: '이할머니',
        phoneNumber: '010-5555-6666',
        gender: 'FEMALE',
        joinDate: '2024.03.10',
        profileImage: null
    }
];

export default function KakaoConnection({ navigation, route }: Props) {
    const { guardianPhoneNumber } = route.params;
    const [selectedSenior, setSelectedSenior] = useState<any>(null);

    const handleSelectSenior = (senior: any) => {
        setSelectedSenior(senior);
    };

    const handleConnect = () => {
        if (!selectedSenior) {
            Alert.alert('오류', '연결할 시니어를 선택해주세요.');
            return;
        }

        // 시니어 정보 확인 화면으로 이동
        navigation.navigate('SeniorInfoConfirm', {
            seniorInfo: selectedSenior,
            guardianPhoneNumber: guardianPhoneNumber
        });
    };

    const handleSkip = () => {
        Alert.alert(
            '연결 건너뛰기',
            '나중에 설정에서 시니어와 연결할 수 있습니다. 계속하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { text: '확인', onPress: () => navigation.navigate('MainTabs') }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>카카오톡 친구 중 시니어 선택</Text>
                <Text style={styles.subtitle}>
                    연결하고 싶은 시니어를 선택해주세요
                </Text>

                {/* 가족 정보 표시 */}
                <View style={styles.guardianInfo}>
                    <Text style={styles.guardianLabel}>가족 전화번호</Text>
                    <Text style={styles.guardianPhone}>{guardianPhoneNumber}</Text>
                </View>

                {/* 시니어 목록 */}
                <View style={styles.seniorList}>
                    <Text style={styles.listTitle}>카카오톡 친구 중 시니어</Text>
                    {dummySeniors.map((senior) => (
                        <TouchableOpacity
                            key={senior.id}
                            style={[
                                styles.seniorCard,
                                selectedSenior?.id === senior.id && styles.selectedSeniorCard
                            ]}
                            onPress={() => handleSelectSenior(senior)}
                        >
                            <View style={styles.seniorInfo}>
                                <View style={styles.profileImage}>
                                    <Text style={styles.profileText}>
                                        {senior.name.charAt(0)}
                                    </Text>
                                </View>
                                <View style={styles.seniorDetails}>
                                    <Text style={styles.seniorName}>{senior.name}</Text>
                                    <Text style={styles.seniorPhone}>{senior.phoneNumber}</Text>
                                    <Text style={styles.seniorGender}>
                                        {senior.gender === 'MALE' ? '남성' : '여성'} • 가입일: {senior.joinDate}
                                    </Text>
                                </View>
                            </View>
                            {selectedSenior?.id === senior.id && (
                                <View style={styles.selectedIndicator}>
                                    <Text style={styles.selectedText}>선택됨</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 연결 버튼 */}
                <TouchableOpacity
                    style={[styles.connectButton, !selectedSenior && styles.disabledButton]}
                    onPress={handleConnect}
                    disabled={!selectedSenior}
                >
                    <Text style={styles.connectButtonText}>
                        {selectedSenior ? `${selectedSenior.name}님과 연결하기` : '시니어를 선택해주세요'}
                    </Text>
                </TouchableOpacity>

                {/* 건너뛰기 버튼 */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonText}>나중에 연결하기</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    guardianInfo: {
        backgroundColor: '#FEE500', // 카카오 노란색
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    guardianLabel: {
        fontSize: 14,
        color: '#3C1E1E',
        marginBottom: 5,
    },
    guardianPhone: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3C1E1E',
    },
    seniorList: {
        marginBottom: 30,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    seniorCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    selectedSeniorCard: {
        borderColor: '#FEE500',
        backgroundColor: '#fffbf0',
    },
    seniorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FEE500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C1E1E',
    },
    seniorDetails: {
        flex: 1,
    },
    seniorName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    seniorPhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    seniorGender: {
        fontSize: 12,
        color: '#999',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FEE500',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    selectedText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3C1E1E',
    },
    connectButton: {
        backgroundColor: '#FEE500',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    connectButtonText: {
        color: '#3C1E1E',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    skipButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    skipButtonText: {
        color: '#666',
        fontSize: 16,
    },
});
