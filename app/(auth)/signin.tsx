import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogin } from './utils/AutHooks';

export default function SignInScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { login, isLoading, isError, error, isSuccess } = useLogin();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle successful login
  useEffect(() => {
    if (isSuccess) {
      // Add a small delay to ensure token is stored before navigation
      setTimeout(() => {
        router.replace('/(chat)');
      }, 300);
    }
  }, [isSuccess]);

  // Handle login errors
  useEffect(() => {
    if (isError && error) {
      setErrors({ email: error.message || 'Login failed' });
    }
  }, [isError, error]);

  // Handle sign in
  const handleSignIn = () => {
    if (!validateForm()) return;

    login({ email, password });
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Logo & Title */}
            <View style={styles.logoSection}>
                <Image
                  source={require('@/assets/images/AILogo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sign in to continue building amazing resumes
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: errors.email ? colors.error : colors.border,
                    },
                  ]}
                >
                  <Ionicons name="mail" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="your.email@example.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors({ ...errors, email: undefined });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: errors.password ? colors.error : colors.border,
                    },
                  ]}
                >
                  <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors({ ...errors, password: undefined });
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>
                )}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity activeOpacity={0.8} onPress={handleSignIn} disabled={isLoading}>
                <LinearGradient
                  colors={colors.gradientPrimary}
                  style={styles.signInButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <>
                      <Text style={[styles.signInButtonText, { color: colors.textInverse }]}>
                        Sign In
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

             
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIconWrapper: {
    width: 130,
    height: 130,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 30,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
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
  signInButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
