import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { UserType, useUser } from '../contexts/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp2'>;

export default function SignUp2({ navigation, route }: Props) {
    const { userType, phoneNumber, isKakao, kakaoName, kakaoGender } = route.params;
    const { login } = useUser();
    const [name, setName] = useState(isKakao ? kakaoName || '' : '');
    const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(
        isKakao ? (kakaoGender as 'MALE' | 'FEMALE') || null : null
    );

    const handleComplete = async () => {
        if (!name.trim()) {
            Alert.alert('오류', '이름을 입력해주세요.');
            return;
        }

        if (!gender) {
            Alert.alert('오류', '성별을 선택해주세요.');
            return;
        }

        try {
            // 테스트용: 실제 API 호출 없이 바로 처리
            console.log('🧪 테스트 모드 - 회원가입 완료:', {
                userType,
                phoneNumber,
                name,
                gender
            });

            // 시니어와 보호자 모두 회원가입 완료 후 자동 로그인
            const newUser = {
                id: Date.now().toString(),
                userId: `user-${Date.now()}`,
                name: name,
                phone: phoneNumber,
                userType: userType,
                profileImage: undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await login(newUser);
            console.log(`🧪 ${userType === UserType.SENIOR ? '시니어' : '가족'} 회원가입 후 자동 로그인 완료`);

            if (userType === UserType.GUARDIAN) {
                // 가족은 로그인 후 시니어 연결 페이지로 이동
                if (isKakao) {
                    // 카카오 로그인인 경우 카카오 연결 페이지로
                    navigation.navigate('KakaoConnection', {
                        guardianPhoneNumber: phoneNumber
                    });
                } else {
                    // 일반 회원가입인 경우 전화번호 연결 페이지로
                    navigation.navigate('GuardianConnection', {
                        guardianPhoneNumber: phoneNumber
                    });
                }
            }
            
        } catch (error) {
            console.error('회원가입 실패:', error);
            Alert.alert('오류', '회원가입에 실패했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>회원가입</Text>
                <Text style={styles.subtitle}>
                    {userType === UserType.SENIOR ? '시니어' : '가족'} 정보를 {isKakao ? '확인' : '입력'}해주세요
                </Text>

                {/* 전화번호 표시 */}
                <View style={styles.phoneDisplay}>
                    <Text style={styles.phoneLabel}>
                        {isKakao ? '카카오 계정' : '전화번호 (테스트용)'}
                    </Text>
                    <Text style={styles.phoneNumber}>
                        {isKakao ? '카카오 계정 연동됨' : phoneNumber}
                    </Text>
                    {!isKakao && (
                        <Text style={styles.phoneLabel}>
                            🧪 테스트 모드: 인증 없이 진행
                        </Text>
                    )}
                </View>

                {/* 이름 입력 */}
                <View style={styles.section}>
                    <Text style={styles.label}>이름</Text>
                    <TextInput
                        style={[styles.input, isKakao && styles.disabledInput]}
                        value={name}
                        onChangeText={setName}
                        placeholder="이름을 입력하세요"
                        maxLength={20}
                        editable={!isKakao}
                    />
                </View>

                {/* 성별 선택 */}
                <View style={styles.section}>
                    <Text style={styles.label}>성별</Text>
                    <View style={styles.genderContainer}>
                        <TouchableOpacity
                            style={[styles.genderButton, gender === 'MALE' && styles.selectedGenderButton]}
                            onPress={() => !isKakao && setGender('MALE')}
                            disabled={isKakao}
                        >
                            <Text style={[styles.genderButtonText, gender === 'MALE' && styles.selectedGenderButtonText]}>
                                남성
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.genderButton, gender === 'FEMALE' && styles.selectedGenderButton]}
                            onPress={() => !isKakao && setGender('FEMALE')}
                            disabled={isKakao}
                        >
                            <Text style={[styles.genderButtonText, gender === 'FEMALE' && styles.selectedGenderButtonText]}>
                                여성
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 완료 버튼 */}
                <TouchableOpacity
                    style={[styles.completeButton, (!name || !gender) && styles.disabledButton]}
                    onPress={handleComplete}
                    disabled={!name || !gender}
                >
                    <Text style={styles.completeButtonText}>
                        {isKakao ? '다음 단계' : '회원가입 완료'}
                    </Text>
                </TouchableOpacity>

                {/* 이전 단계로 돌아가기 */}
                <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backLinkText}>이전 단계로 돌아가기</Text>
                </TouchableOpacity>
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
        justifyContent: 'center',
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
    phoneDisplay: {
        backgroundColor: '#e8f5e8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 30,
        alignItems: 'center',
    },
    phoneLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    phoneNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    genderButton: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    selectedGenderButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    genderButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    selectedGenderButtonText: {
        color: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    completeButton: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    backLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    backLinkText: {
        color: '#007AFF',
        fontSize: 14,
    },
});
