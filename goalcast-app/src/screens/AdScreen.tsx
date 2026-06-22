import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  StatusBar, Animated, Linking, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import type { Match, AppConfig } from '../lib/api';

interface Props {
  navigation: any;
  route: { params: { match: Match; config: AppConfig | null } };
}

export default function AdScreen({ navigation, route }: Props) {
  const { match, config } = route.params;

  // Ad configurations
  const adsScreenEnabled = config?.adsScreenEnabled;
  const webAdEnabled = !adsScreenEnabled && config?.adEnabled && config?.adWebUrl;
  const adDuration = (adsScreenEnabled ? config?.adsScreenDuration : config?.adDuration) || 15;

  const [countdown, setCountdown] = useState(adDuration);
  const [canSkip, setCanSkip] = useState(false);
  const [hasClickedAd, setHasClickedAd] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // WebView Ad timer logic (Auto-start)
  useEffect(() => {
    if (adsScreenEnabled) return; // Custom ad has different start trigger

    if (!webAdEnabled) {
      navigation.replace('Player', { match });
      return;
    }

    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    // Animate the progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: adDuration * 1000,
      useNativeDriver: false,
    }).start();

    // Countdown tick
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-navigate to player when done
    setTimeout(() => {
      navigation.replace('Player', { match });
    }, adDuration * 1000);
  };

  const handleAdClick = () => {
    if (!hasClickedAd) {
      setHasClickedAd(true);
      startTimer();
    }
    const targetUrl = config?.adsScreenClickUrl || 'https://google.com';
    navigation.navigate('AdBrowser', { url: targetUrl, title: 'Verification Server' });
  };

  const handleTutorialClick = () => {
    if (config?.adsScreenTutorialUrl) {
      Linking.openURL(config.adsScreenTutorialUrl).catch(() => { });
    }
  };

  const handleTelegramClick = () => {
    if (config?.adsScreenTelegramUrl) {
      Linking.openURL(config.adsScreenTelegramUrl).catch(() => { });
    }
  };

  const handleSkip = () => {
    navigation.replace('Player', { match });
  };

  // If no ads are enabled, skip to player
  if (!adsScreenEnabled && !webAdEnabled) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  // Render Web WebView Ad (Original)
  if (webAdEnabled) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
        <WebView
          source={{ uri: config!.adWebUrl }}
          style={styles.webview}
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          onShouldStartLoadWithRequest={() => true}
        />
        <View style={styles.topOverlay} pointerEvents="box-none">
          <View style={styles.matchPreview} pointerEvents="none">
            <Ionicons name="football" size={13} color="#22c55e" />
            <Text style={styles.matchPreviewText} numberOfLines={1}>{match.title}</Text>
          </View>
          <TouchableOpacity
            onPress={canSkip ? handleSkip : undefined}
            activeOpacity={canSkip ? 0.75 : 1}
            style={[styles.skipBtn, canSkip && styles.skipBtnReady]}
          >
            {canSkip ? (
              <View style={styles.skipInner}>
                <Text style={styles.skipText}>Skip Ad</Text>
                <Ionicons name="play-skip-forward" size={14} color="#000" />
              </View>
            ) : (
              <View style={styles.skipInner}>
                <Text style={styles.skipText}>Skip in {countdown}s</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.progressTrack} pointerEvents="none">
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>
    );
  }

  // Render Custom Verification Ad Screen
  return (
    <View style={styles.customContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={styles.customHeader}>
        <Text style={styles.customLogo}>Goalcast-TV</Text>
        <TouchableOpacity style={styles.getAppBtn}>
          <Ionicons name="download-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.getAppText}>Get APP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ad Title */}
        <Text style={styles.headline}>
          {config?.adsScreenHeadline || 'Activate Your Stream - Supporting Goalcast-TV'}
        </Text>
        <Text style={styles.subheadline}>
          {config?.adsScreenSubheadline || 'Follow steps to access the video server'}
        </Text>

        {/* Large Clicking Target Button */}
        <TouchableOpacity style={styles.clickTarget} onPress={handleAdClick} activeOpacity={0.85}>
          <LinearGradient
            colors={['#f43f5e', '#e11d48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <View style={styles.buttonInner}>
              <Ionicons name="hand-pointer-outline" size={32} color="#fff" style={styles.handLeft} />
              <Text style={styles.clickHereText}>Click Here</Text>
              <Ionicons name="hand-pointer-outline" size={32} color="#fff" style={styles.handRight} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Custom Progress / Skip Bar (Shown after clicking) */}
        {hasClickedAd && (
          <View style={styles.customTimerContainer}>
            <View style={styles.customProgressTrack}>
              <Animated.View style={[styles.customProgressBar, { width: progressWidth }]} />
            </View>
            <Text style={styles.customTimerText}>
              {canSkip ? 'Verification completed!' : `Checking server... ${countdown}s remaining`}
            </Text>
            {canSkip && (
              <TouchableOpacity style={styles.watchNowBtn} onPress={handleSkip}>
                <Text style={styles.watchNowBtnText}>Watch Now</Text>
                <Ionicons name="play-circle-outline" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Instructions Card */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>Click the large red button above 👇</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>Wait for the server verification page to finish loading 🤔</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>Let the stream background load for {adDuration} seconds ⏳</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>After {adDuration} seconds, the server check will be complete! 🥳</Text>
          </View>
        </View>

        {/* Help Tutorial Button */}
        {config?.adsScreenTutorialUrl ? (
          <TouchableOpacity style={styles.tutorialBtn} onPress={handleTutorialClick}>
            <LinearGradient
              colors={['#854d0e', '#713f12']}
              style={styles.tutorialGradient}
            >
              <Ionicons name="videocam-outline" size={24} color="#fef08a" />
              <View style={styles.tutorialTexts}>
                <Text style={styles.tutorialTitle}>Need Help Loading? -</Text>
                <Text style={styles.tutorialSub}>Watch the video tutorial</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#fef08a" style={styles.tutorialArrow} />
            </LinearGradient>
          </TouchableOpacity>
        ) : null}

        {/* Telegram Button */}
        {config?.adsScreenTelegramUrl ? (
          <TouchableOpacity style={styles.telegramBtn} onPress={handleTelegramClick}>
            <LinearGradient
              colors={['#1e3a8a', '#172554']}
              style={styles.telegramGradient}
            >
              <Ionicons name="paper-plane-outline" size={24} color="#93c5fd" />
              <View style={styles.telegramTexts}>
                <Text style={styles.telegramTitle}>Join our Telegram Channel</Text>
                <Text style={styles.telegramSub}>For stream alerts, schedules & more</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#93c5fd" style={styles.telegramArrow} />
            </LinearGradient>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },

  // Top Overlay WebView Ad
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 10,
  },
  matchPreview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 10,
  },
  matchPreviewText: { color: '#a1a1aa', fontSize: 12, flex: 1 },

  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipBtnReady: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  skipInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  skipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  progressTrack: {
    position: 'absolute',
    top: 98,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  progressBar: { height: 3, backgroundColor: '#22c55e' },

  // Custom Verification Ad Layout
  customContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
    backgroundColor: '#0c0c0c',
  },
  customLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  getAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  getAppText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fef08a',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 28,
  },
  subheadline: {
    fontSize: 13,
    color: '#e4e4e7',
    textAlign: 'center',
    marginTop: 8,
  },
  clickTarget: {
    width: '100%',
    height: 90,
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  clickHereText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginHorizontal: 12,
  },
  handLeft: {
    transform: [{ rotate: '90deg' }, { scaleX: -1 }],
  },
  handRight: {
    transform: [{ rotate: '-90deg' }],
  },

  // Custom Verification Timer
  customTimerContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  customProgressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  customProgressBar: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  customTimerText: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  watchNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
  },
  watchNowBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Instructions Box
  instructionsCard: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1c1c1c',
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ca8a04',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 8,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    color: '#ca8a04',
    fontWeight: '700',
    marginRight: 6,
    fontSize: 14,
  },
  instructionText: {
    color: '#e4e4e7',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },

  // Tutorial Button
  tutorialBtn: {
    width: '100%',
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#713f12',
  },
  tutorialGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tutorialTexts: {
    marginLeft: 12,
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fef08a',
  },
  tutorialSub: {
    fontSize: 13,
    color: '#eab308',
    marginTop: 2,
  },
  tutorialArrow: {
    marginLeft: 6,
  },

  // Telegram Button
  telegramBtn: {
    width: '100%',
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  telegramGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  telegramTexts: {
    marginLeft: 12,
    flex: 1,
  },
  telegramTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#93c5fd',
  },
  telegramSub: {
    fontSize: 12,
    color: '#60a5fa',
    marginTop: 2,
  },
  telegramArrow: {
    marginLeft: 6,
  },
});
