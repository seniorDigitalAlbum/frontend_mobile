import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import relationshipApiService from '../services/api/relationshipApiService';
import { GuardianSeniorRelationship } from '../services/api/relationshipApiService';
import { useUser } from '../contexts/UserContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { colors } from '../styles/commonStyles';

export default function SeniorNotification() {
    const { settings } = useAccessibility();
    const { user } = useUser();
    const { relationshipRequests, markNotificationAsRead } = useWebSocket();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // 웹소켓에서 받은 관계 요청 중 PENDING 상태인 것만 필터링
    const pendingRelationships = relationshipRequests.filter(req => req.status === 'PENDING');

    useEffect(() => {
        loadPendingRelationships();
    }, []);

    const loadPendingRelationships = async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            // 웹소켓에서 이미 데이터를 받고 있다면 API 호출 생략 가능
            // 하지만 초기 로드나 웹소켓 연결 실패 시에는 API 호출 필요
            if (relationshipRequests.length === 0) {
                const relationships = await relationshipApiService.getPendingRelationships(parseInt(user.id));
                console.log('API에서 대기 중인 관계 요청 로드 완료:', relationships.length);
            } else {
                console.log('웹소켓에서 이미 데이터를 받고 있음');
            }
        } catch (error) {
            console.error('대기 중인 관계 조회 실패:', error);
            Alert.alert('오류', '관계 요청을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPendingRelationships();
        setRefreshing(false);
    };

    const handleApprove = async (relationshipId: number) => {
        if (!user?.id) return;

        try {
            const result = await relationshipApiService.approveRelationship(relationshipId, parseInt(user.id));
            if (result.success) {
                Alert.alert('성공', '연결이 승인되었습니다.');
                // 관련 알림을 읽음으로 표시
                markNotificationAsRead(relationshipId);
            } else {
                Alert.alert('오류', result.message || '승인에 실패했습니다.');
            }
        } catch (error) {
            console.error('관계 승인 실패:', error);
            Alert.alert('오류', '승인 처리 중 오류가 발생했습니다.');
        }
    };

    const handleReject = async (relationshipId: number) => {
        try {
            const result = await relationshipApiService.rejectRelationship(relationshipId);
            if (result.success) {
                Alert.alert('완료', '연결 요청을 거부했습니다.');
                // 관련 알림을 읽음으로 표시
                markNotificationAsRead(relationshipId);
            } else {
                Alert.alert('오류', result.message || '거부에 실패했습니다.');
            }
        } catch (error) {
            console.error('관계 거부 실패:', error);
            Alert.alert('오류', '거부 처리 중 오류가 발생했습니다.');
        }
    };

    const renderRelationshipItem = ({ item }: { item: GuardianSeniorRelationship }) => (
        <View 
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            <View className="flex-row items-center mb-3">
                <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.green }}
                >
                    <Ionicons name="person" size={24} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-black">
                        {item.guardianName || '보호자'}님이 연결을 요청했습니다
                    </Text>
                    <Text className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                    </Text>
                </View>
            </View>
            
            <View className="flex-row space-x-3">
                <TouchableOpacity
                    onPress={() => handleApprove(item.id)}
                    className="flex-1 bg-green-500 rounded-xl py-3 items-center"
                >
                    <Text className="text-white font-bold">승인</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleReject(item.id)}
                    className="flex-1 bg-gray-300 rounded-xl py-3 items-center"
                >
                    <Text className="text-gray-700 font-bold">거부</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500">로딩 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-4 border-b border-gray-200">
                <Text className="text-2xl font-bold text-black">연결 요청</Text>
                <Text className="text-sm text-gray-500 mt-1">
                    보호자로부터 온 연결 요청을 확인해주세요
                </Text>
            </View>
            
            {pendingRelationships.length === 0 ? (
                <View className="flex-1 justify-center items-center p-8">
                    <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
                    <Text className="text-lg font-medium text-gray-500 mt-4">
                        대기 중인 연결 요청이 없습니다
                    </Text>
                    <Text className="text-sm text-gray-400 mt-2 text-center">
                        보호자가 연결을 요청하면 여기에 표시됩니다
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pendingRelationships}
                    renderItem={renderRelationshipItem}
                    keyExtractor={(item) => item.id.toString()}
                    className="p-4"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </SafeAreaView>
    );
}
