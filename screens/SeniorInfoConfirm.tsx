import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SeniorInfoConfirm'>;

export default function SeniorInfoConfirm({ navigation, route }: Props) {
    const { seniorInfo, guardianPhoneNumber } = route.params;

    const handleConfirm = () => {
        console.log('🧪 시니어 연결 완료');
        // 강제로 Home 화면으로 이동
        setTimeout(() => {
            try {
                console.log('🧪 네비게이션 시도 시작');
                // 방법 1: 직접 navigate 시도
                try {
                    navigation.navigate('MainTabs', { screen: 'Home' });
                    console.log('🧪 navigate 성공');
                    return;
                } catch (navError1) {
                    console.log('🧪 navigate 실패:', navError1);
                }
                
                // 방법 2: 부모 네비게이션 navigate
                try {
                    navigation.getParent()?.navigate('MainTabs', { screen: 'Home' });
                    console.log('🧪 부모 navigate 성공');
                    return;
                } catch (navError2) {
                    console.log('🧪 부모 navigate 실패:', navError2);
                }
                
                // 방법 3: 최상위 네비게이션 찾아서 reset
                let parent = navigation.getParent();
                while (parent?.getParent()) {
                    parent = parent.getParent();
                }
                if (parent) {
                    parent.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
                    });
                    console.log('🧪 최상위 reset 성공');
                } else {
                    console.error('🧪 최상위 네비게이션을 찾을 수 없음');
                }
            } catch (navError) {
                console.error('🧪 모든 네비게이션 방법 실패:', navError);
            }
        }, 100);
    };

    const handleCancel = () => {
        Alert.alert(
            '연결 취소',
            '시니어 연결을 취소하시겠습니까?',
            [
                { text: '아니오', style: 'cancel' },
                { text: '예', onPress: () => navigation.goBack() }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>시니어 정보 확인</Text>
                <Text style={styles.subtitle}>
                    연결할 시니어의 정보를 확인해주세요
                </Text>

                {/* 시니어 정보 카드 */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>이름</Text>
                        <Text style={styles.infoValue}>{seniorInfo.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>전화번호</Text>
                        <Text style={styles.infoValue}>{seniorInfo.phoneNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>성별</Text>
                        <Text style={styles.infoValue}>
                            {seniorInfo.gender === 'MALE' ? '남성' : '여성'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>가입일</Text>
                        <Text style={styles.infoValue}>{seniorInfo.joinDate}</Text>
                    </View>
                </View>

                {/* 가족 정보 */}
                <View style={styles.guardianInfo}>
                    <Text style={styles.guardianLabel}>가족 전화번호</Text>
                    <Text style={styles.guardianPhone}>{guardianPhoneNumber}</Text>
                </View>

                {/* 연결 후 할 수 있는 것 */}
                <View style={styles.helpSection}>
                    <Text style={styles.helpTitle}>연결 후 할 수 있는 것</Text>
                    <Text style={styles.helpItem}>• 시니어의 대화 기록 확인</Text>
                    <Text style={styles.helpItem}>• 감정 분석 결과 모니터링</Text>
                    <Text style={styles.helpItem}>• 진행 상황 추적</Text>
                    <Text style={styles.helpItem}>• 알림 및 경고 수신</Text>
                </View>

                {/* 버튼들 */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmButtonText}>연결하기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
    infoCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    infoValue: {
        fontSize: 16,
        color: '#666',
    },
    guardianInfo: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    guardianLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    guardianPhone: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    helpSection: {
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    helpItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    buttonContainer: {
        gap: 10,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
});
