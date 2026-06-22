import React, { useEffect, useState } from 'react';
import { View, StatusBar, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import type { Match } from '../lib/api';

interface Props {
  navigation: any;
  route: { params: { url: string; title: string; match: Match; duration: number } };
}

export default function AdBrowserScreen({ navigation, route }: Props) {
  const { url, title, match, duration } = route.params;
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Automatic close and redirect to player when timer ends
          navigation.replace('Player', { match });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      
      {/* Locked Header (No Close Button!) */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>Unlocks in {countdown}s</Text>
        </View>
      </View>

      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        javaScriptEnabled
        allowsFullscreenVideo
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  timerBadge: {
    backgroundColor: '#ef444420',
    borderWidth: 1,
    borderColor: '#ef444450',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '800',
  },
});
