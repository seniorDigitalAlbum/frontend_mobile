import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserType } from '../contexts/UserContext';

interface UserTypeSelectorProps {
  selectedType: UserType | null;
  onTypeSelect: (type: UserType) => void;
}

export default function UserTypeSelector({ selectedType, onTypeSelect }: UserTypeSelectorProps) {
  return (
    <View className="p-5">
      <Text className="text-lg font-bold text-center mb-8 text-gray-800">사용자 유형을 선택해주세요</Text>
      
      <View className="gap-4">
        <TouchableOpacity
          className={`p-5 rounded-xl border-2 ${
            selectedType === UserType.SENIOR 
              ? 'bg-blue-500 border-blue-500' 
              : 'bg-gray-100 border-gray-300'
          }`}
          onPress={() => onTypeSelect(UserType.SENIOR)}
        >
          <Text className={`text-base font-semibold mb-1 ${
            selectedType === UserType.SENIOR ? 'text-white' : 'text-gray-800'
          }`}>
            시니어
          </Text>
          <Text className={`text-sm ${
            selectedType === UserType.SENIOR ? 'text-blue-100' : 'text-gray-600'
          }`}>
            직접 대화를 나누는 사용자
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`p-5 rounded-xl border-2 ${
            selectedType === UserType.GUARDIAN 
              ? 'bg-blue-500 border-blue-500' 
              : 'bg-gray-100 border-gray-300'
          }`}
          onPress={() => onTypeSelect(UserType.GUARDIAN)}
        >
          <Text className={`text-base font-semibold mb-1 ${
            selectedType === UserType.GUARDIAN ? 'text-white' : 'text-gray-800'
          }`}>
            가족
          </Text>
          <Text className={`text-sm ${
            selectedType === UserType.GUARDIAN ? 'text-blue-100' : 'text-gray-600'
          }`}>
            시니어의 가족 또는 지인
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
