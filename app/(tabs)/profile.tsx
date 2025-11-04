import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/header';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status when screen is focused
  useFocusEffect(
    useCallback(() => {
      checkAuthStatus();
    }, [])
  );

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const email = await AsyncStorage.getItem('userEmail');
      setIsLoggedIn(!!token);
      setUserEmail(email || '');
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userEmail');
              setIsLoggedIn(false);
              setUserEmail('');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderLoggedInView = () => (
    <View style={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.avatarContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="person" size={48} color="#fff" />
        </LinearGradient>

        <Text style={[styles.userName, { color: colors.text }]}>
          Welcome Back!
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {userEmail}
        </Text>
      </View>

      {/* Profile Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => router.push('/(chat)/new')}
        >
          <View style={[styles.optionIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>My Conversations</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              View all your chat history
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/templets')}
        >
          <View style={[styles.optionIconContainer, { backgroundColor: '#10b981' + '15' }]}>
            <Ionicons name="document-text" size={24} color="#10b981" />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>My Resumes</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              View all your generated resumes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

       
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleLogout}
        style={styles.logoutButtonContainer}
      >
        <View style={[styles.logoutButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderLoggedOutView = () => (
    <View style={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
      
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          Welcome to ResumeAI
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          Sign in to access your resumes and create professional CVs with AI assistance
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="rocket" size={24} color={colors.primary} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>AI-Powered</Text>
            <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
              Create resumes in minutes with AI
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: '#10b981' + '15' }]}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
          </View>
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>ATS Optimized</Text>
            <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
              Pass through applicant tracking systems
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: '#3b82f6' + '15' }]}>
            <Ionicons name="download" size={24} color="#3b82f6" />
          </View>
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>Easy Export</Text>
            <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
              Download as PDF instantly
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/signin')}
        >
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.primaryActionButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryActionText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryActionButton, { borderColor: colors.border, backgroundColor: colors.background }]}
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={[styles.secondaryActionText, { color: colors.text }]}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoggedIn ? renderLoggedInView() : renderLoggedOutView()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  // Logged In View
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 20px rgba(251, 113, 33, 0.3)',
      },
    }),
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButtonContainer: {
    marginTop: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Logged Out View
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    gap: 20,
    marginBottom: 48,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 16,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(251, 113, 33, 0.35)',
      },
    }),
  },
  primaryActionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  secondaryActionButton: {
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
