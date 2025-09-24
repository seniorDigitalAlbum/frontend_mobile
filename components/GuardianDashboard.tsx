import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuardianDashboardProps {
  onViewSeniorProgress: () => void;
  onViewConversations: () => void;
  onViewEmotionHistory: () => void;
}

export default function GuardianDashboard({ 
  onViewSeniorProgress, 
  onViewConversations, 
  onViewEmotionHistory 
}: GuardianDashboardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>시니어 관리</Text>
      
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={onViewSeniorProgress}>
          <View style={styles.cardIcon}>
            <Ionicons name="trending-up" size={24} color="#007AFF" />
          </View>
          <Text style={styles.cardTitle}>진행 상황</Text>
          <Text style={styles.cardSubtitle}>시니어의 대화 진행도 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onViewConversations}>
          <View style={styles.cardIcon}>
            <Ionicons name="chatbubbles" size={24} color="#34C759" />
          </View>
          <Text style={styles.cardTitle}>대화 기록</Text>
          <Text style={styles.cardSubtitle}>이전 대화 내용 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onViewEmotionHistory}>
          <View style={styles.cardIcon}>
            <Ionicons name="heart" size={24} color="#FF3B30" />
          </View>
          <Text style={styles.cardTitle}>감정 분석</Text>
          <Text style={styles.cardSubtitle}>감정 변화 추이 확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
});
