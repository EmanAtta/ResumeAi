import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Modal,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useChatMessages, useSendMessage } from './_hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'model';
  createdAt: string;
  conversationId: string;
  pdfUrl?: string | null;
};

export default function ChatScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id || '';

  const { data, isLoading, isError, error } = useChatMessages(chatId);
  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage(chatId);

  const [inputText, setInputText] = useState('');
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  const conversation = data?.data;
  const messages = conversation?.messages || [];
  const isTyping = isSending;

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

  useEffect(() => {
    // Typing animation
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isTyping]);

  const handleOpenPdf = (pdfUrl: string) => {
    setSelectedPdfUrl(pdfUrl);
    setShowPdfModal(true);
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setSelectedPdfUrl(null);
  };

  const handleDownloadPdf = async () => {
    if (!selectedPdfUrl) return;

    try {
      setIsDownloading(true);

      if (Platform.OS === 'web') {
        try {
          const response = await fetch(selectedPdfUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `Resume_${Date.now()}.pdf`;
          link.setAttribute('download', `Resume_${Date.now()}.pdf`);
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          const link = document.createElement('a');
          link.href = selectedPdfUrl;
          link.download = `Resume_${Date.now()}.pdf`;
          link.setAttribute('download', `Resume_${Date.now()}.pdf`);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        const fileUri = `${FileSystem.documentDirectory}Resume_${Date.now()}.pdf`;

        try {
          console.log('Downloading PDF to:', fileUri);

          const downloadResult = await FileSystem.downloadAsync(
            selectedPdfUrl,
            fileUri
          );

          console.log('Download result:', downloadResult);
          const localFileUri = downloadResult.uri;

          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            console.log('Sharing file from:', localFileUri);
            await Sharing.shareAsync(localFileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Download Resume',
              UTI: 'com.adobe.pdf',
            });
          } else {
            console.log('Sharing not available, opening in browser');
            await Linking.openURL(selectedPdfUrl);
          }
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          await Linking.openURL(selectedPdfUrl);
        }
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      if (Platform.OS === 'web') {
        window.open(selectedPdfUrl, '_blank');
      } else {
        try {
          await Linking.openURL(selectedPdfUrl);
        } catch (linkErr) {
          console.error('Error opening PDF link:', linkErr);
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const messageText = inputText.trim();
    setInputText('');

    // Send message via API
    sendMessageMutation({ message: messageText });

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!isUser && (
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.aiAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="sparkles" size={16} color={colors.textInverse} />
          </LinearGradient>
        )}

        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.messageBubble,
              isUser
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.messageText, { color: isUser ? colors.textInverse : colors.text }]}>
              {item.content}
            </Text>
          </View>

          {/* PDF Card - Display if pdfUrl exists */}
          {item.pdfUrl && (
            <View style={[styles.pdfCard, {
              backgroundColor: colorScheme === 'light' ? '#fffcf5' : colors.cardBackground,
              borderColor: colorScheme === 'light' ? '#f0e5d6' : colors.border,
            }]}>
              <View style={styles.pdfCardHeader}>
                <View style={[styles.pdfIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="document-text" size={28} color={colors.primary} />
                </View>
                <View style={styles.pdfCardInfo}>
                  <Text style={[styles.pdfCardTitle, { color: colors.text }]}>
                    Your Resume is Ready!
                  </Text>
                  <Text style={[styles.pdfCardSubtitle, { color: colors.textSecondary }]}>
                    PDF Document • Ready to view
                  </Text>
                </View>
              </View>

              <View style={styles.pdfCardActions}>
                <TouchableOpacity
                  style={[styles.pdfActionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleOpenPdf(item.pdfUrl!)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={18} color={colors.text} />
                  <Text style={[styles.pdfActionButtonText, { color: colors.text }]}>
                    View
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pdfActionButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setSelectedPdfUrl(item.pdfUrl!);
                    handleDownloadPdf();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="download-outline" size={18} color="#fff" />
                  <Text style={[styles.pdfActionButtonText, { color: '#fff' }]}>
                    Download
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={[styles.messageTime, { color: colors.textSecondary, textAlign: isUser ? 'right' : 'left' }]}>
            {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>

        {isUser && (
          <View style={[styles.userAvatar, { backgroundColor: colors.backgroundSecondary }]}>
            <IconSymbol name="person.fill" size={16} color={colors.primary} />
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
      <LinearGradient
        colors={colors.gradientPrimary}
        style={styles.aiAvatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <IconSymbol name="sparkles" size={16} color={colors.textInverse} />
      </LinearGradient>

      <View style={[styles.typingBubble, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.textSecondary, opacity: typingAnim }]} />
        <Animated.View
          style={[
            styles.typingDot,
            {
              backgroundColor: colors.textSecondary,
              opacity: typingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        />
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.textSecondary, opacity: typingAnim }]} />
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.headerAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="sparkles" size={20} color={colors.textInverse} />
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {isTyping ? 'Typing...' : 'Online'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.backgroundSecondary }]}
          activeOpacity={0.7}
        >
          <IconSymbol name="ellipsis" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading messages...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.text }]}>Failed to load messages</Text>
            <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
              {error?.message || 'Please try again later'}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? renderTypingIndicator : null}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.attachButton}
              activeOpacity={0.7}
            >
              <IconSymbol name="paperclip" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={inputText.trim().length === 0}
          >
            <LinearGradient
              colors={inputText.trim().length > 0 ? colors.gradientPrimary : [colors.border, colors.border]}
              style={styles.sendButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="paperplane.fill" size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* PDF Viewer Modal */}
      <Modal
        visible={showPdfModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClosePdfModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={handleClosePdfModal}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Resume Preview
            </Text>

            <TouchableOpacity
              style={[styles.modalDownloadButton, { backgroundColor: colors.primary }]}
              onPress={handleDownloadPdf}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="download" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* PDF Preview */}
          <View style={styles.modalContent}>
            {selectedPdfUrl && (
              <>
                <View style={styles.webViewContainer}>
                  <WebView
                    source={{
                      uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(selectedPdfUrl)}`
                    }}
                    style={styles.webView}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View style={styles.webViewLoading}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                          Loading PDF...
                        </Text>
                      </View>
                    )}
                    scalesPageToFit={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    originWhitelist={['*']}
                    mixedContentMode="compatibility"
                    setSupportMultipleWindows={false}
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      console.warn('WebView error: ', nativeEvent);
                    }}
                  />
                </View>

                {/* Quick Actions Footer */}
                <View style={[styles.pdfActionsFooter, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.footerActionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => selectedPdfUrl && Linking.openURL(selectedPdfUrl)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="open-outline" size={20} color={colors.text} />
                    <Text style={[styles.footerActionButtonText, { color: colors.text }]}>
                      Open in Browser
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    maxHeight: 100,
    paddingVertical: 4,
  },
  attachButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  // PDF Card Styles
  pdfCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    maxWidth: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 12px rgba(251, 113, 33, 0.1)',
      },
    }),
  },
  pdfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  pdfIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfCardInfo: {
    flex: 1,
  },
  pdfCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  pdfCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  pdfCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  pdfActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  pdfActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  modalDownloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 20,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  pdfActionsFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    minWidth: 200,
  },
  footerActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
