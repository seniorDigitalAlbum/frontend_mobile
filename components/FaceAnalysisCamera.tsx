import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import TempCamera from './TempCamera';
import { analyzeFaceLocal, analyzeEmotion } from '../services/faceRecognitionService';

interface FaceAnalysisCameraProps {
  onAnalysisComplete?: (result: any) => void;
}

export default function FaceAnalysisCamera({ onAnalysisComplete }: FaceAnalysisCameraProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFaceDetected = async (faceData: any) => {
    setIsAnalyzing(true);
    
    try {
      // 얼굴 인식 AI 분석 실행
      const result = await analyzeFaceLocal(faceData);
      
      if (result.success && result.faceDetected) {
        setAnalysisResult(result);
        
        // 감정 분석도 실행
        const emotion = await analyzeEmotion(faceData);
        
        const finalResult = {
          ...result,
          emotion,
          timestamp: new Date().toISOString(),
        };
        
        if (onAnalysisComplete) {
          onAnalysisComplete(finalResult);
        }
        
        Alert.alert(
          '분석 완료',
          `감정: ${emotion}\n나이: ${result.age}\n성별: ${result.gender}\n신뢰도: ${(result.confidence * 100).toFixed(1)}%`
        );
      } else {
        Alert.alert('얼굴 인식 실패', result.error || '얼굴을 인식할 수 없습니다.');
      }
    } catch (error) {
      console.error('분석 중 오류:', error);
      Alert.alert('오류', '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = (photoUri: string) => {
    console.log('사진 촬영됨:', photoUri);
    // 사진 저장 또는 다른 처리
  };

  return (
    <View className="space-y-4">
      <TempCamera
        onFaceDetected={handleFaceDetected}
        onCapture={handleCapture}
      />
      
      {isAnalyzing && (
        <View className="bg-blue-100 p-4 rounded-lg">
          <Text className="text-blue-800 text-center font-medium">
            얼굴을 분석하고 있습니다...
          </Text>
        </View>
      )}
      
      {analysisResult && (
        <View className="bg-green-100 p-4 rounded-lg">
          <Text className="text-green-800 text-center font-medium">
            분석 완료! 감정: {analysisResult.emotion || '알 수 없음'}
          </Text>
        </View>
      )}
    </View>
  );
}
