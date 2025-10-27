import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/header';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { usePdfs } from './_pdfHooks';
import { PdfItem } from './_pdfServices';

const { width, height } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CONTENT_PADDING = 20;
const CARDS_PER_ROW = width > 768 ? 4 : width > 600 ? 3 : 2;
const CARD_WIDTH = (width - (CONTENT_PADDING * 2) - (CARD_MARGIN * (CARDS_PER_ROW - 1))) / CARDS_PER_ROW;

export default function TemplatesScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [selectedPdf, setSelectedPdf] = useState<PdfItem | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = usePdfs(currentPage, pageSize);

  const handleOpenPdf = (pdf: PdfItem) => {
    setSelectedPdf(pdf);
    setShowPdfModal(true);
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setSelectedPdf(null);
  };

  const handleDownloadPdf = async () => {
    if (!selectedPdf) return;

    try {
      setIsDownloading(true);

      if (Platform.OS === 'web') {
        try {
          const response = await fetch(selectedPdf.pdfUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `${selectedPdf.title}.pdf`;
          link.setAttribute('download', `${selectedPdf.title}.pdf`);
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          const link = document.createElement('a');
          link.href = selectedPdf.pdfUrl;
          link.download = `${selectedPdf.title}.pdf`;
          link.setAttribute('download', `${selectedPdf.title}.pdf`);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // For mobile, download the file first, then share it
        const sanitizedTitle = selectedPdf.title.replace(/[^a-z0-9]/gi, '_');
        const fileUri = `${FileSystem.documentDirectory}${sanitizedTitle}.pdf`;

        try {
          console.log('Downloading PDF to:', fileUri);

          // Download the file to local storage
          const downloadResult = await FileSystem.downloadAsync(
            selectedPdf.pdfUrl,
            fileUri
          );

          console.log('Download result:', downloadResult);
          console.log('Downloaded file URI:', downloadResult.uri);

          // Use downloadResult.uri which is guaranteed to have the correct file:// scheme
          const localFileUri = downloadResult.uri;

          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            console.log('Sharing file from:', localFileUri);
            await Sharing.shareAsync(localFileUri, {
              mimeType: 'application/pdf',
              dialogTitle: `Download ${selectedPdf.title}`,
              UTI: 'com.adobe.pdf',
            });
          } else {
            // Fallback: open in browser
            console.log('Sharing not available, opening in browser');
            await Linking.openURL(selectedPdf.pdfUrl);
          }
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          // Fallback to opening in browser
          await Linking.openURL(selectedPdf.pdfUrl);
        }
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      if (Platform.OS === 'web') {
        window.open(selectedPdf.pdfUrl, '_blank');
      } else {
        try {
          await Linking.openURL(selectedPdf.pdfUrl);
        } catch (linkErr) {
          console.error('Error opening PDF link:', linkErr);
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNextPage = () => {
    if (data?.data.meta && currentPage < data.data.meta.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderPdfCard = (pdf: PdfItem) => (
    <TouchableOpacity
      key={pdf.id}
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
          shadowColor: colorScheme === 'dark' ? '#000' : '#fb7121',
          width: CARD_WIDTH,
          borderWidth: colorScheme === 'light' ? 1 : 0,
          borderColor: colorScheme === 'light' ? '#f0e5d6' : 'transparent',
        },
      ]}
      onPress={() => handleOpenPdf(pdf)}
      activeOpacity={0.8}
    >
      {/* PDF Thumbnail */}
      <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Image
          source={{ uri: pdf.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {/* Overlay gradient for better text visibility */}
        <View style={[styles.imageOverlay, {
          backgroundColor: colorScheme === 'light'
            ? 'rgba(251, 113, 33, 0.1)'
            : 'rgba(0, 0, 0, 0.3)'
        }]} />
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {pdf.title}
        </ThemedText>
        <ThemedText
          style={[styles.cardDate, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {new Date(pdf.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </ThemedText>
      </View>

      {/* View Badge */}
      <View style={[styles.badge, { backgroundColor: colors.tint }]}>
        <ThemedText style={[styles.badgeText, { color: '#fff' }]}>View PDF</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: colorScheme === 'light' ? '#fef9f3' : colors.background
      }
    ]}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.tint}
          />
        }
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <ThemedText type="title" style={styles.title}>
              Resume Templates
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your professionally designed resumes
            </ThemedText>
          </View>

          {/* Stats Section */}
          {data?.data.meta && (
            <View style={[
              styles.statsContainer,
              {
                backgroundColor: colorScheme === 'light' ? '#fffcf5' : colors.cardBackground,
                borderWidth: colorScheme === 'light' ? 1 : 0,
                borderColor: colorScheme === 'light' ? '#f0e5d6' : 'transparent',
              }
            ]}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
                  {data.data.meta.total}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Templates
                </ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
                  {data.data.meta.totalPages}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Pages
                </ThemedText>
              </View>
            </View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading templates...
              </ThemedText>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.errorBackground }]}>
              <ThemedText style={[styles.errorText, { color: colors.error }]}>
                {error.message}
              </ThemedText>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.tint }]}
                onPress={() => refetch()}
              >
                <ThemedText style={[styles.retryButtonText, { color: '#fff' }]}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && data?.data.items.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyEmoji}>📄</ThemedText>
              <ThemedText style={styles.emptyTitle}>No Templates Yet</ThemedText>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Create your first resume to see it here
              </ThemedText>
            </View>
          )}

          {/* PDF Grid */}
          {!isLoading && !error && data && data.data.items.length > 0 && (
            <>
              <View style={styles.grid}>
                {data.data.items.map((pdf) => renderPdfCard(pdf))}
              </View>

              {/* Pagination Controls */}
              {data.data.meta.totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      {
                        backgroundColor: colors.cardBackground,
                        opacity: currentPage === 1 ? 0.5 : 1,
                      },
                    ]}
                    onPress={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ThemedText style={styles.paginationButtonText}>← Previous</ThemedText>
                  </TouchableOpacity>

                  <View style={styles.pageInfo}>
                    <ThemedText style={[styles.pageText, { color: colors.text }]}>
                      Page {currentPage} of {data.data.meta.totalPages}
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      {
                        backgroundColor: colors.cardBackground,
                        opacity: currentPage === data.data.meta.totalPages ? 0.5 : 1,
                      },
                    ]}
                    onPress={handleNextPage}
                    disabled={currentPage === data.data.meta.totalPages}
                  >
                    <ThemedText style={styles.paginationButtonText}>Next →</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

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

            <ThemedText style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedPdf?.title}
            </ThemedText>

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
            {selectedPdf && (
              <>
                {/* WebView to display full PDF */}
                <View style={styles.webViewContainer}>
                  <WebView
                    source={{
                      uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(selectedPdf.pdfUrl)}`
                    }}
                    style={styles.webView}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View style={styles.webViewLoading}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                          Loading PDF...
                        </ThemedText>
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

                {/* PDF Info Footer */}
                <View style={[styles.pdfInfoFooter, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
                  <ThemedText style={[styles.pdfInfoText, { color: colors.textSecondary }]}>
                    Created: {new Date(selectedPdf.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </ThemedText>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    padding: CONTENT_PADDING,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: CARD_MARGIN,
  },
  // Card Styles
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
     
    }),
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    position: 'relative',
    overflow: 'hidden',
    padding:0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    marginHorizontal:2,
    marginTop:10,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  // States
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#fb7121',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(251, 113, 33, 0.12)',
      },
    }),
  },
  paginationButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pageInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 15,
    fontWeight: '600',
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
  pdfInfoFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  pdfInfoText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
