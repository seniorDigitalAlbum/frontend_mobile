import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserType } from '../contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/commonStyles';

interface UserTypeSelectorProps {
  selectedType: UserType | null;
  onTypeSelect: (type: UserType) => void;
}

export default function UserTypeSelector({ selectedType, onTypeSelect }: UserTypeSelectorProps) {
  return (
    <View className="w-full">
      <View className="gap-4">
        <TouchableOpacity
          onPress={() => onTypeSelect(UserType.SENIOR)}
        >
          {selectedType === UserType.SENIOR ? (
            <View 
              className="rounded-2xl p-5 shadow-lg"
              style={{
                backgroundColor: colors.green,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text className="text-2xl font-bold mb-1 text-white">
                시니어
              </Text>
              <Text className="text-lg text-white">
                AI와 직접 대화를 나누고 일기를 생성해요.
              </Text>
            </View>
          ) : (
            <View 
              className="p-5 rounded-2xl shadow-sm"
              style={{
                backgroundColor: colors.beige,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-2xl font-bold mb-1" style={{ color: colors.darkGreen }}>
                시니어
              </Text>
              <Text className="text-lg" style={{ color: colors.darkGreen }}>
                AI와 직접 대화를 나누고 일기를 생성해요.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onTypeSelect(UserType.GUARDIAN)}
        >
          {selectedType === UserType.GUARDIAN ? (
            <View 
              className="rounded-2xl p-5 shadow-lg"
              style={{
                backgroundColor: colors.green,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text className="text-2xl font-bold mb-1 text-white">
                가족
              </Text>
              <Text className="text-lg text-white">
                시니어와 연결 되어 소통할 수 있어요.
              </Text>
            </View>
          ) : (
            <View 
              className="p-5 rounded-2xl shadow-sm"
              style={{
                backgroundColor: colors.beige,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
                <Text className="text-2xl font-bold mb-1" style={{ color: colors.darkGreen }}>
                가족
              </Text>
              <Text className="text-lg" style={{ color: colors.darkGreen }}>
                시니어와 연결 되어 소통할 수 있어요.
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
