import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';

type HeaderProps = {
  showBackButton?: boolean;
  title?: string;
  transparent?: boolean;
};

export function Header({ showBackButton = false, title, transparent = false }: HeaderProps) {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

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
              {/* <Text style={[styles.logoText, { color: colors.text }]}>
                Resume<Text style={{ color: colors.primary }}>AI</Text>
              </Text> */}
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
        </View>
      </View>
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
    width:110,
    height: 70,
    borderRadius: 16,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
 
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
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
});
