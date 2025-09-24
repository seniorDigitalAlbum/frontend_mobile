import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { UserType } from '../contexts/UserContext';
import UserTypeSelector from '../components/UserTypeSelector';
import firebaseAuthService from '../services/firebaseAuthService';
import signUpApiService from '../services/api/signUpApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUp({ navigation }: Props) {
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    
    // 테스트용: 바로 인증 완료 상태로 설정
    useEffect(() => {
        setIsCodeSent(true);
        setIsVerified(true);
    }, []);
    const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
    const [seniorPhoneNumber, setSeniorPhoneNumber] = useState('');

    const formatPhoneNumber = (text: string) => {
        // 숫자만 추출
        const numbers = text.replace(/[^0-9]/g, '');
        
        // 010-1234-5678 형식으로 포맷팅
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else if (numbers.length <= 11) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }
    };

    const handlePhoneNumberChange = (text: string) => {
        const formatted = formatPhoneNumber(text);
        setPhoneNumber(formatted);
    };

    const handleSeniorPhoneNumberChange = (text: string) => {
        const formatted = formatPhoneNumber(text);
        setSeniorPhoneNumber(formatted);
    };

    const sendVerificationCode = async () => {
        if (!firebaseAuthService.isValidPhoneNumber(phoneNumber)) {
            Alert.alert('오류', '올바른 전화번호를 입력해주세요.');
            return;
        }

        // 테스트용: 인증번호 전송 없이 바로 성공 처리
        console.log('테스트용: 인증번호 전송 시뮬레이션:', phoneNumber);
        setIsCodeSent(true);
        Alert.alert('인증번호 전송', '테스트용: 인증번호가 전송되었습니다. (실제 전송 안됨)');
        
        // 실제 Firebase 사용 시 아래 코드 사용
        /*
        try {
            const result = await firebaseAuthService.sendVerificationCode(phoneNumber);
            if (result.success) {
                setIsCodeSent(true);
                Alert.alert('인증번호 전송', result.message);
            } else {
                Alert.alert('오류', result.message);
            }
        } catch (error) {
            Alert.alert('오류', '인증번호 전송에 실패했습니다.');
        }
        */
    };

    const verifyCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            Alert.alert('오류', '6자리 인증번호를 입력해주세요.');
            return;
        }

        // 테스트용: 아무 6자리 숫자나 입력하면 인증 성공
        console.log('테스트용: 인증번호 검증 시뮬레이션:', verificationCode);
        setIsVerified(true);
        Alert.alert('인증 완료', '테스트용: 인증이 완료되었습니다. (실제 검증 안됨)');
        
        // 실제 Firebase 사용 시 아래 코드 사용
        /*
        try {
            const result = await firebaseAuthService.verifyCode(verificationCode);
            if (result.success && result.isVerified) {
                setIsVerified(true);
                Alert.alert('인증 완료', result.message);
            } else {
                Alert.alert('오류', result.message);
            }
        } catch (error) {
            Alert.alert('오류', '인증번호가 올바르지 않습니다.');
        }
        */
    };

    const handleSignUp = async () => {
        if (!selectedUserType) {
            Alert.alert('오류', '사용자 유형을 선택해주세요.');
            return;
        }

        if (!phoneNumber || phoneNumber.length < 13) {
            Alert.alert('오류', '전화번호를 입력해주세요.');
            return;
        }

        // 테스트용: 인증 없이 바로 SignUp2로 이동
        console.log('🧪 테스트 모드 - 회원가입 1단계 완료:', {
            userType: selectedUserType,
            phoneNumber
        });

        // SignUp2 화면으로 이동
        navigation.navigate('SignUp2', {
            userType: selectedUserType,
            phoneNumber: phoneNumber
        });
    };

    return (
        <View style={styles.container}>
            {/* 웹용 reCAPTCHA 컨테이너 */}
            <div id="recaptcha-container" style={{ display: 'none' }}></div>
            
            <View style={styles.content}>
                <Text style={styles.title}>회원가입</Text>

                {/* 사용자 타입 선택 */}
                <View style={styles.section}>
                    <UserTypeSelector
                        selectedType={selectedUserType}
                        onTypeSelect={setSelectedUserType}
                    />
                </View>

                {/* 전화번호 입력 */}
                <View style={styles.section}>
                    <Text style={styles.label}>전화번호 (테스트용)</Text>
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={handlePhoneNumberChange}
                        placeholder="010-1234-5678"
                        keyboardType="phone-pad"
                        maxLength={13}
                    />
                    <Text style={styles.helpText}>
                        🧪 테스트 모드: 전화번호 인증 없이 바로 가입 가능합니다.
                    </Text>
                </View>


                {/* 다음 단계 버튼 */}
                <TouchableOpacity
                    style={[styles.signUpButton, (!selectedUserType || !phoneNumber) && styles.disabledButton]}
                    onPress={handleSignUp}
                    disabled={!selectedUserType || !phoneNumber}
                >
                    <Text style={styles.signUpButtonText}>다음 단계</Text>
                </TouchableOpacity>

                {/* 로그인으로 돌아가기 */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginLinkText}>이미 계정이 있으신가요? 로그인</Text>
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
        marginBottom: 30,
        color: '#333',
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
    phoneInputContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    phoneInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 8,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    verificationContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    verificationInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    verifyButton: {
        backgroundColor: '#34C759',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 8,
        justifyContent: 'center',
    },
    verifyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
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
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    helpText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    signUpButton: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#007AFF',
        fontSize: 14,
    },
});
