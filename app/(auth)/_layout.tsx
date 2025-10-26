import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export default function AuthLayout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
