import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ApiEndpoints } from '@/utils/ApiEndpoints';

export default function TestConnectionScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setTesting(true);
    setResult('Testing connection...');

    try {
      const response = await fetch(ApiEndpoints.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123',
        }),
      });

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResult(`✅ Server is responding!\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        setResult(`⚠️ Server returned HTML instead of JSON.\nThis usually means:\n1. Backend server is not running\n2. Wrong URL\n3. Server error\n\nFirst 200 chars: ${text.substring(0, 200)}`);
      }
    } catch (error: any) {
      setResult(`❌ Connection failed!\n\nError: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. URL is correct: ${ApiEndpoints.auth.login}\n3. Network connection is working`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>API Connection Test</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Test your backend connection
        </Text>

        <View style={[styles.infoBox, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            <Text style={{ fontWeight: '700' }}>Login Endpoint:{'\n'}</Text>
            {ApiEndpoints.auth.login}
          </Text>
          <Text style={[styles.infoText, { color: colors.text, marginTop: 12 }]}>
            <Text style={{ fontWeight: '700' }}>Register Endpoint:{'\n'}</Text>
            {ApiEndpoints.auth.register}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={testConnection}
          disabled={testing}
        >
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.testButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {testing ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <>
                <IconSymbol name="network" size={20} color={colors.textInverse} />
                <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                  Test Connection
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {result ? (
          <View style={[styles.resultBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
          </View>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  infoBox: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resultBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
});
