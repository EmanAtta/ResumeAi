import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/header';
import { useChats } from './_hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatListScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, isError, error } = useChats();

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      router.replace('/(auth)/signin');
    }
  };

  // Helper function to get chat title from last message (first 7 words)
  const getChatTitle = (lastMessage: string | null): string => {
    if (!lastMessage) return 'New Chat';

    const words = lastMessage.trim().split(/\s+/);
    const title = words.slice(0, 7).join(' ');
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  };

  // Helper function to truncate last message for preview
  const truncateMessage = (message: string | null): string => {
    if (!message) return 'No messages yet';

    // Take first 50 characters
    if (message.length <= 50) return message;
    return message.substring(0, 50) + '...';
  };

  const conversations = data?.data || [];

  const filteredConversations = conversations.filter((conv) => {
    const title = conv.title || getChatTitle(conv.lastMessage);
    const message = conv.lastMessage || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleNewChat = () => {
    router.push('/(chat)/new');
  };

  const handleChatPress = (chatId: string) => {
    router.push(`/(chat)/${chatId}`);
  };

  const renderConversationItem = ({ item }: { item: any }) => {
    const chatTitle = item.title || getChatTitle(item.lastMessage);
    const messagePreview = truncateMessage(item.lastMessage);
    const timeAgo = getTimeAgo(item.updatedAt || item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.conversationItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => handleChatPress(item.id)}
      >
        <View style={styles.conversationLeft}>
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="doc.text.fill" size={24} color={colors.textInverse} />
          </LinearGradient>

          <View style={styles.conversationContent}>
            <Text style={[styles.conversationTitle, { color: colors.text }]} numberOfLines={1}>
              {chatTitle}
            </Text>
            <Text style={[styles.conversationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
              {messagePreview}
            </Text>
          </View>
        </View>

        <View style={styles.conversationRight}>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[colors.primary + '20', colors.primary + '05']}
        style={styles.emptyIcon}
      >
        <Ionicons name="chatbubbles" size={64} color={colors.primary} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start a new chat to create your resume with AI
      </Text>

    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Chats" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading chats...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to load chats</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            {error?.message || 'Please try again later'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating New Chat Button - Always visible */}
      <TouchableOpacity
        style={styles.fabContainer}
        activeOpacity={0.8}
        onPress={handleNewChat}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conversationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  conversationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  conversationRight: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 60,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
