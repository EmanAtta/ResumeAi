/**
 * ResumeAI - Modern Professional Color Palette
 * Orange-themed design system converted from Tailwind CSS
 * A comprehensive color system for the AI Resume Builder Chat App
 */

import { Platform } from 'react-native';

// HSL to RGB conversion helper
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Primary Brand Colors (Orange Theme)
const primaryOrange = '#fb7121'; // hsl(24, 95%, 53%) - Main brand orange
const accentOrange = '#f97316'; // hsl(14, 90%, 53%) - Accent orange
const secondaryBeige = '#fffcf5'; // hsl(33, 100%, 96%) - Secondary background
const mutedOrange = '#fef7ed'; // hsl(33, 100%, 96%) - Muted background

// Neutral Colors - Light Mode
const white = '#ffffff'; // hsl(0, 0%, 100%)
const foregroundDark = '#1a1209'; // hsl(20, 14%, 10%)
const mutedForeground = '#6b5d47'; // hsl(25, 10%, 45%)
const borderLight = '#f0e5d6'; // hsl(33, 30%, 90%)

// Neutral Colors - Dark Mode (Brown-Dark Theme)
const backgroundDark = '#1c1410'; // hsl(30, 30%, 10%) - Warm dark brown
const cardDark = '#2a231c'; // hsl(30, 25%, 14%) - Medium dark brown
const foregroundLight = '#fffcf5'; // hsl(33, 100%, 98%)
const mutedForegroundDark = '#a89a88'; // hsl(30, 15%, 60%) - Warm muted
const borderDark = '#3d342a'; // hsl(30, 20%, 20%) - Brown border

// Semantic Colors
const success = '#10b981'; // Green for success
const warning = '#f59e0b'; // Amber for warnings
const error = '#ef4444'; // Red for errors
const destructive = '#dc2626'; // hsl(0, 84%, 60%)
const destructiveDark = '#7f1d1d'; // hsl(0, 63%, 31%)
const info = '#3b82f6'; // Blue for info

export const Colors = {
  light: {
    // Primary (Orange Theme)
    primary: primaryOrange,
    primaryDark: accentOrange,
    secondary: secondaryBeige,
    accent: accentOrange,

    // Background (White base)
    background: white,
    backgroundSecondary: mutedOrange,
    surface: white,
    card: white,
    cardBackground: white,
    errorBackground: '#fee2e2',

    // Text
    text: foregroundDark,
    textSecondary: mutedForeground,
    textTertiary: mutedForeground,
    textInverse: white,

    // UI Elements
    border: borderLight,
    divider: borderLight,
    shadow: 'rgba(251, 113, 33, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    input: borderLight,
    ring: primaryOrange,

    // Icons & Navigation
    icon: mutedForeground,
    iconActive: primaryOrange,
    tabIconDefault: mutedForeground,
    tabIconSelected: primaryOrange,
    tint: primaryOrange,

    // Chat Bubbles
    chatBubbleUser: primaryOrange,
    chatBubbleUserText: white,
    chatBubbleAI: mutedOrange,
    chatBubbleAIText: foregroundDark,

    // Semantic
    success: success,
    warning: warning,
    error: error,
    destructive: destructive,
    info: info,

    // Buttons
    buttonPrimary: primaryOrange,
    buttonPrimaryText: white,
    buttonSecondary: secondaryBeige,
    buttonSecondaryText: foregroundDark,
    buttonDisabled: borderLight,
    buttonDisabledText: mutedForeground,

    // Gradients
    gradientPrimary: [primaryOrange, accentOrange],
    gradientHero: [mutedOrange, '#fef9f3'],
    gradientAccent: [primaryOrange, '#f4a04d'],

    // Popover
    popover: white,
    popoverForeground: foregroundDark,
  },
  dark: {
    // Primary (Orange Theme)
    primary: primaryOrange,
    primaryDark: accentOrange,
    secondary: cardDark,
    accent: accentOrange,

    // Background (Dark theme)
    background: backgroundDark,
    backgroundSecondary: cardDark,
    surface: cardDark,
    card: cardDark,
    cardBackground: cardDark,
    errorBackground: '#3d2020',

    // Text
    text: foregroundLight,
    textSecondary: mutedForegroundDark,
    textTertiary: mutedForegroundDark,
    textInverse: foregroundDark,

    // UI Elements
    border: borderDark,
    divider: borderDark,
    shadow: 'rgba(28, 20, 16, 0.4)',
    overlay: 'rgba(28, 20, 16, 0.8)',
    input: borderDark,
    ring: primaryOrange,

    // Icons & Navigation
    icon: mutedForegroundDark,
    iconActive: primaryOrange,
    tabIconDefault: mutedForegroundDark,
    tabIconSelected: primaryOrange,
    tint: primaryOrange,

    // Chat Bubbles
    chatBubbleUser: primaryOrange,
    chatBubbleUserText: white,
    chatBubbleAI: cardDark,
    chatBubbleAIText: foregroundLight,

    // Semantic
    success: success,
    warning: warning,
    error: error,
    destructive: destructiveDark,
    info: info,

    // Buttons
    buttonPrimary: primaryOrange,
    buttonPrimaryText: white,
    buttonSecondary: cardDark,
    buttonSecondaryText: foregroundLight,
    buttonDisabled: borderDark,
    buttonDisabledText: mutedForegroundDark,

    // Gradients
    gradientPrimary: [primaryOrange, accentOrange],
    gradientHero: ['#1c1410', '#2a231c'],
    gradientAccent: [primaryOrange, '#f4a04d'],

    // Popover
    popover: cardDark,
    popoverForeground: foregroundLight,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
