import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  StatusBar, Animated,
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
  // Ad is enabled if adEnabled flag is on AND a web URL is configured in admin panel
  const adEnabled = config?.adEnabled && config?.adWebUrl;
  const adDuration = config?.adDuration || 15;

  const [countdown, setCountdown] = useState(adDuration);
  const [canSkip, setCanSkip] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!adEnabled) {
      // No ad configured — go straight to player
      navigation.replace('Player', { match });
      return;
    }

    // Animate the shrinking progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: adDuration * 1000,
      useNativeDriver: false,
    }).start();

    // Countdown tick every second
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

    // Auto-navigate to player when time is up
    const timer = setTimeout(() => {
      navigation.replace('Player', { match });
    }, adDuration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => {
    navigation.replace('Player', { match });
  };

  if (!adEnabled) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />

      {/* ── Full-screen WebView Ad ── */}
      <WebView
        source={{ uri: config!.adWebUrl }}
        style={styles.webview}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // Prevent user from navigating away inside the ad
        onShouldStartLoadWithRequest={() => true}
      />

      {/* ── Top overlay: skip button + match name ── */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        {/* Left: match preview */}
        <View style={styles.matchPreview} pointerEvents="none">
          <Ionicons name="football" size={13} color="#22c55e" />
          <Text style={styles.matchPreviewText} numberOfLines={1}>{match.title}</Text>
        </View>

        {/* Right: skip / countdown button */}
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

      {/* ── Progress bar at top (shrinks from full to 0) ── */}
      <View style={styles.progressTrack} pointerEvents="none">
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* ── Bottom bar: "Up Next" match info ── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.95)']}
        style={styles.bottomBar}
        pointerEvents="none"
      >
        <View style={styles.upNextRow}>
          <View style={styles.upNextBadge}>
            <Text style={styles.upNextLabel}>UP NEXT</Text>
          </View>
          <View style={styles.teamsRow}>
            {match.teamA?.logo ? (
              <Image source={{ uri: match.teamA.logo }} style={styles.teamLogo} resizeMode="contain" />
            ) : null}
            <Text style={styles.teamsText}>
              {match.teamA?.name}
              <Text style={styles.vsText}> vs </Text>
              {match.teamB?.name}
            </Text>
            {match.teamB?.logo ? (
              <Image source={{ uri: match.teamB.logo }} style={styles.teamLogo} resizeMode="contain" />
            ) : null}
          </View>
          <Text style={styles.countdownText}>
            {canSkip ? 'Tap Skip to watch now' : `Starting in ${countdown}s`}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },

  // Top overlay (skip button + match label) — sits on top of WebView
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

  // Progress bar — just below the top overlay
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

  // Bottom gradient + match info
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  upNextRow: { alignItems: 'center', gap: 8 },
  upNextBadge: {
    backgroundColor: '#22c55e20',
    borderWidth: 1,
    borderColor: '#22c55e40',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  upNextLabel: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamLogo: { width: 30, height: 30, borderRadius: 15 },
  teamsText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  vsText: { color: '#52525b', fontWeight: '400' },
  countdownText: { color: '#71717a', fontSize: 12 },
});
