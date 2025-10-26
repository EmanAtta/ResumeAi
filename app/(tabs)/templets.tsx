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
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Header } from '@/components/header';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { usePdfs } from './_pdfHooks';
import { PdfItem } from './_pdfServices';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARDS_PER_ROW = width > 768 ? 3 : width > 500 ? 2 : 1;
const CARD_WIDTH = (width - CARD_MARGIN * (CARDS_PER_ROW + 1)) / CARDS_PER_ROW;

export default function TemplatesScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);

  const { data, isLoading, error, refetch, isRefetching } = usePdfs(currentPage, pageSize);

  const handleOpenPdf = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open this URL:", url);
      }
    } catch (err) {
      console.error('Error opening PDF:', err);
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
      onPress={() => handleOpenPdf(pdf.pdfUrl)}
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
        <ThemedText style={styles.cardTitle} numberOfLines={2}>
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
        <ThemedText style={styles.badgeText}>View PDF</ThemedText>
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
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
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
    padding: 20,
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
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 20px rgba(251, 113, 33, 0.15)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.4, // Aspect ratio for resume
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 24,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    fontSize: 12,
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
});
