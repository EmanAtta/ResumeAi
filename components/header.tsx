import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Image, Alert, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HeaderProps = {
  showBackButton?: boolean;
  title?: string;
  transparent?: boolean;
  onAuthChange?: () => void;
};

export function Header({ showBackButton = false, title, transparent = false, onAuthChange }: HeaderProps) {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const email = await AsyncStorage.getItem('userEmail');
    const name = await AsyncStorage.getItem('userName');
    setIsLoggedIn(!!token);
    setUserEmail(email || '');
    setUserName(name || '');
  };

  const getInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return userEmail?.[0]?.toUpperCase() || 'U';
  };

  const handleLogout = () => {
    setShowUserMenu(false);
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
              await AsyncStorage.removeItem('userName');
              setIsLoggedIn(false);
              setUserEmail('');
              setUserName('');
              if (onAuthChange) {
                onAuthChange();
              }
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[
      styles.headerWrapper,
      transparent && styles.transparentHeader,
      {
        backgroundColor: transparent ? 'transparent' : colors.background,
      }
    ]}>
      <View style={[
        styles.headerContainer,
        !transparent && {
          borderBottomColor: colorScheme === 'light' ? colors.border : colors.border,
          backgroundColor: colorScheme === 'light' ? colors.background : colors.cardBackground,
        }
      ]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoContainer}>
              <View style={styles.logoIconWrapper}>
                <Image
                  source={require('@/assets/images/AILogo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}
        </View>

        {/* Center Section - Title */}
        {title && (
          <View style={styles.centerSection}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Right Section - Actions */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
            activeOpacity={0.7}
            onPress={toggleTheme}
          >
            <Ionicons
              name={colorScheme === 'dark' ? 'sunny' : 'moon'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          {isLoggedIn ? (
            <TouchableOpacity
              style={styles.userButton}
              activeOpacity={0.7}
              onPress={() => setShowUserMenu(true)}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                style={styles.userAvatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.userInitials}>{getInitials()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginIconButton}
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/signin')}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                style={styles.loginIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowUserMenu(false)}
        >
          <View style={[styles.userMenuContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {/* User Info */}
            <View style={[styles.userInfoSection, { borderBottomColor: colors.border }]}>
              <LinearGradient
                colors={colors.gradientPrimary}
                style={styles.menuAvatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.menuAvatarText}>{getInitials()}</Text>
              </LinearGradient>
              <View style={styles.userInfo}>
                {userName && (
                  <Text style={[styles.menuUserName, { color: colors.text }]} numberOfLines={1}>
                    {userName}
                  </Text>
                )}
                <Text style={[styles.menuUserEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {userEmail}
                </Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.background }]}
                activeOpacity={0.7}
                onPress={handleLogout}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: colors.error + '15' }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.error} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingTop: Platform.OS === 'ios' ? 50 : Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  transparentHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconWrapper: {
    width: 100,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  logoImage: {
    width: 110,
    height: 70,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  userButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(251, 113, 33, 0.3)',
      },
    }),
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  loginIconButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 3px 12px rgba(251, 113, 33, 0.35)',
      },
    }),
  },
  loginIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // User Menu Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : Platform.OS === 'android' ? 70 : 20,
    paddingRight: 20,
  },
  userMenuContainer: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  userInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  menuUserEmail: {
    fontSize: 13,
    fontWeight: '500',
  },
  menuItems: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
