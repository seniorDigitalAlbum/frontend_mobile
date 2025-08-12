import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { apiService } from './src/services/api';

export default function App() {
  const [response, setResponse] = useState<string>('');

  const testBackendConnection = async () => {
    try {
      const result = await apiService.test();
      setResponse(JSON.stringify(result, null, 2));
      Alert.alert('Success', 'Backend connection successful!');
    } catch (error) {
      setResponse('Error: ' + (error as Error).message);
      Alert.alert('Error', 'Failed to connect to backend');
    }
  };

  const sendTestData = async () => {
    try {
      const testData = {
        message: 'Hello from React Native!',
        timestamp: new Date().toISOString(),
      };
      const result = await apiService.sendData(testData);
      setResponse(JSON.stringify(result, null, 2));
      Alert.alert('Success', 'Data sent successfully!');
    } catch (error) {
      setResponse('Error: ' + (error as Error).message);
      Alert.alert('Error', 'Failed to send data');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DearMind App</Text>
      <Text style={styles.subtitle}>React Native + Spring Boot</Text>
      
      <TouchableOpacity style={styles.button} onPress={testBackendConnection}>
        <Text style={styles.buttonText}>Test Backend Connection</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={sendTestData}>
        <Text style={styles.buttonText}>Send Test Data</Text>
      </TouchableOpacity>
      
      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    maxHeight: 200,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  responseText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});
