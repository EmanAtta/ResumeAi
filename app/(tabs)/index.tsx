import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Header } from '@/components/header';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

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

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO SECTION */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LinearGradient
            colors={colors.gradientHero}
            style={styles.heroSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              {/* Premium Badge */}
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={colors.gradientPrimary}
                  style={styles.badge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.badgeIconWrapper}>
                    <IconSymbol name="sparkles" size={14} color={colors.textInverse} />
                  </View>
                  <Text style={[styles.badgeText, { color: colors.textInverse }]}>
                    AI-Powered Resume Builder
                  </Text>
                </LinearGradient>
              </View>

              {/* Hero Title with Gradient */}
              <View style={styles.titleWrapper}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  Create Your{'\n'}
                  <Text style={[styles.heroTitleAccent, { color: colors.primary }]}>
                    Professional Resume
                  </Text>
                  {'\n'}in Minutes ⚡
                </Text>
              </View>

              {/* Hero Description */}
              <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                Let our AI assistant guide you through building a stunning, ATS-friendly resume that gets you hired faster.
              </Text>

              {/* CTA Buttons */}
              <View style={styles.ctaContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push('/(chat)/new')}
                >
                  <LinearGradient
                    colors={colors.gradientPrimary}
                    style={styles.primaryButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                      Start Building Free
                    </Text>
                    <View style={styles.buttonIconWrapper}>
                      <IconSymbol name="arrow.right" size={18} color={colors.textInverse} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, {
                    borderColor: colors.border,
                    backgroundColor: colors.background
                  }]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(tabs)/templets')}
                >
                  <IconSymbol name="doc.text" size={20} color={colors.primary} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    Browse Templates
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Trust Indicators */}
              <View style={[styles.trustContainer, { borderTopColor: colors.border }]}>
                <View style={styles.trustItem}>
                  <View style={styles.starContainer}>
                    {[...Array(5)].map((_, i) => (
                      <IconSymbol
                        key={i}
                        name="star.fill"
                        size={16}
                        color="#FFB800"
                      />
                    ))}
                  </View>
                  <Text style={[styles.trustText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>10,000+</Text> Happy Users
                  </Text>
                </View>

                <View style={[styles.dividerVertical, { backgroundColor: colors.border }]} />

                <View style={styles.trustItem}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSecondary }]}>
                    <IconSymbol name="clock.fill" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.trustText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>3 min</Text> Average Time
                  </Text>
                </View>
              </View>
            </View>

            {/* Hero Illustration - Enhanced */}
            <View style={styles.heroImageWrapper}>
              <View style={[styles.heroImageContainer, {
                backgroundColor: colors.background,
                borderColor: colors.border,
              }]}>
                <View style={[styles.floatingCard, styles.floatingCard1, { backgroundColor: colors.backgroundSecondary }]}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  <Text style={[styles.floatingText, { color: colors.text }]}>ATS Optimized</Text>
                </View>

                <View style={styles.mainIconWrapper}>
                  <LinearGradient
                    colors={[colors.primary + '20', colors.primary + '05']}
                    style={styles.iconGlow}
                  >
                    <IconSymbol name="doc.text.fill" size={100} color={colors.primary} />
                  </LinearGradient>
                </View>

                <View style={[styles.floatingCard, styles.floatingCard2, { backgroundColor: colors.backgroundSecondary }]}>
                  <IconSymbol name="sparkles" size={18} color={colors.primary} />
                  <Text style={[styles.floatingText, { color: colors.text }]}>AI Powered</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* FEATURES SECTION - Enhanced */}
        <View style={[styles.featuresSection, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionSubtitle, { color: colors.primary }]}>
              Why Choose ResumeAI
            </Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Build Smarter, Not Harder
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Everything you need to create a professional resume in minutes
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <EnhancedFeatureCard
              icon="sparkles"
              iconColor={colors.primary}
              title="AI-Powered Assistant"
              description="Chat with our intelligent AI to build your resume step-by-step. No more blank page syndrome!"
              colors={colors}
              gradient={['#fb7121', '#f97316']}
            />

            <EnhancedFeatureCard
              icon="bolt.fill"
              iconColor="#FFB800"
              title="Instant Live Preview"
              description="See your resume come to life in real-time as you chat with the AI assistant."
              colors={colors}
              gradient={['#FFB800', '#FFA500']}
            />

            <EnhancedFeatureCard
              icon="checkmark.circle.fill"
              iconColor={colors.success}
              title="ATS-Friendly Templates"
              description="Choose from professionally designed templates that pass through applicant tracking systems."
              colors={colors}
              gradient={['#10b981', '#059669']}
            />

            <EnhancedFeatureCard
              icon="arrow.down.doc.fill"
              iconColor="#3b82f6"
              title="One-Click Download"
              description="Download your polished resume as a PDF, ready to send to employers immediately."
              colors={colors}
              gradient={['#3b82f6', '#2563eb']}
            />
          </View>

          {/* How It Works Section */}
          <View style={styles.howItWorksSection}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 32 }]}>
              How It Works
            </Text>

            <View style={styles.stepsContainer}>
              <StepCard
                number="1"
                icon="message.fill"
                title="Start Chatting"
                description="Answer simple questions in a conversational way"
                colors={colors}
                isLast={false}
              />
              <StepCard
                number="2"
                icon="wand.and.stars"
                title="AI Builds Resume"
                description="Watch as AI creates your professional resume"
                colors={colors}
                isLast={false}
              />
              <StepCard
                number="3"
                icon="arrow.down.doc"
                title="Download & Apply"
                description="Get your PDF and start applying to jobs"
                colors={colors}
                isLast={true}
              />
            </View>
          </View>
        </View>

        {/* TESTIMONIAL SECTION */}
        <View style={[styles.testimonialSection, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.testimonialQuote, { color: colors.text }]}>
            "ResumeAI helped me land my dream job in just 2 weeks. The AI assistant made it so easy!"
          </Text>
          <View style={styles.testimonialAuthor}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.textInverse, fontSize: 18, fontWeight: '700' }}>SK</Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: colors.text }]}>Sarah Johnson</Text>
              <Text style={[styles.authorRole, { color: colors.textSecondary }]}>Senior Developer at Google</Text>
            </View>
          </View>
        </View>

        {/* CTA SECTION - Enhanced */}
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.ctaSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaIconBadge}>
              <IconSymbol name="rocket.fill" size={32} color={colors.textInverse} />
            </View>
            <Text style={[styles.ctaTitle, { color: colors.textInverse }]}>
              Ready to Get Started?
            </Text>
            <Text style={[styles.ctaSubtitle, { color: colors.textInverse }]}>
              Join thousands of job seekers who landed their dream job with ResumeAI
            </Text>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.background }]}
              activeOpacity={0.9}
              onPress={() => router.push('/(chat)/new')}
            >
              <Text style={[styles.ctaButtonText, { color: colors.primary }]}>
                Create Your Resume Now
              </Text>
              <IconSymbol name="arrow.right" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.ctaNote, { color: colors.textInverse }]}>
              ✓ No credit card required  •  ✓ Free forever
            </Text>
          </View>
        </LinearGradient>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <IconSymbol name="doc.text.fill" size={24} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ResumeAI - Your AI-Powered Career Partner
          </Text>
          <Text style={[styles.footerCopyright, { color: colors.textTertiary }]}>
            © 2025 ResumeAI. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Enhanced Feature Card Component
type EnhancedFeatureCardProps = {
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  colors: any;
  gradient: string[];
};

const EnhancedFeatureCard = ({ icon, iconColor, title, description, colors, gradient }: EnhancedFeatureCardProps) => {
  return (
    <View style={[styles.featureCard, {
      backgroundColor: colors.card,
      borderColor: colors.border,
    }]}>
      <LinearGradient
        colors={[gradient[0] + '15', gradient[1] + '05']}
        style={styles.featureIconContainer}
      >
        <IconSymbol name={icon} size={28} color={iconColor} />
      </LinearGradient>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
};

// Step Card Component
type StepCardProps = {
  number: string;
  icon: any;
  title: string;
  description: string;
  colors: any;
  isLast: boolean;
};

const StepCard = ({ number, icon, title, description, colors, isLast }: StepCardProps) => {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepLeft}>
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.stepNumber}
        >
          <Text style={[styles.stepNumberText, { color: colors.textInverse }]}>{number}</Text>
        </LinearGradient>
        {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
      </View>
      <View style={[styles.stepContent, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.stepIconWrapper}>
          <IconSymbol name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  heroContent: {
    marginBottom: 48,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeIconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  titleWrapper: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 50,
    letterSpacing: -1,
  },
  heroTitleAccent: {
    fontSize: 40,
    fontWeight: '900',
  },
  heroDescription: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  ctaContainer: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIconWrapper: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 28,
    paddingBottom: 8,
    borderTopWidth: 1,
    marginTop: 8,
  },
  trustItem: {
    alignItems: 'center',
    gap: 8,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  trustText: {
    fontSize: 13,
    textAlign: 'center',
  },
  dividerVertical: {
    width: 1,
    height: 40,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageWrapper: {
    alignItems: 'center',
  },
  heroImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    padding: 40,
    borderWidth: 2,
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    position: 'relative',
    width: width - 48,
    minHeight: 300,
  },
  floatingCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingCard1: {
    top: 40,
    left: -10,
  },
  floatingCard2: {
    bottom: 40,
    right: -10,
  },
  floatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
  howItWorksSection: {
    marginTop: 64,
  },
  stepsContainer: {
    gap: 24,
  },
  stepCard: {
    flexDirection: 'row',
    gap: 20,
  },
  stepLeft: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fb7121',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '800',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 8,
  },
  stepContent: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
  },
  stepIconWrapper: {
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  testimonialSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    marginVertical: 32,
  },
  testimonialQuote: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  authorRole: {
    fontSize: 14,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  ctaSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    opacity: 0.95,
    paddingHorizontal: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaNote: {
    fontSize: 13,
    marginTop: 20,
    opacity: 0.9,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerCopyright: {
    fontSize: 12,
  },
});
