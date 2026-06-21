import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Match, StreamServer } from '../lib/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: { params: { match: Match } };
}

export default function PlayerScreen({ navigation, route }: Props) {
  const { match } = route.params;
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [webViewKey, setWebViewKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeServer: StreamServer | undefined = match.streams?.[activeServerIdx];

  // Build the HTML to embed the stream
  const buildHtml = (server: StreamServer) => {
    if (server.embedCode) {
      // Direct embed code — wrap in a full page
      return `<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100% !important; height: 100% !important; border: none; }
    video { width: 100% !important; height: 100% !important; }
  </style>
</head>
<body>${server.embedCode}</body></html>`;
    }
    if (server.url) {
      // Direct stream URL — use a video player page
      return `<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; }
    video { width: 100%; height: 100%; object-fit: contain; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>
  <video id="v" controls autoplay playsinline></video>
  <script>
    var v = document.getElementById('v');
    var src = '${server.url}';
    if (Hls.isSupported()) {
      var hls = new Hls({ lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(v);
      hls.on(Hls.Events.MANIFEST_PARSED, function() { v.play(); });
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = src;
      v.play();
    }
  </script>
</body></html>`;
    }
    return '<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>No stream available</p></body></html>';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />

      {/* Video Player */}
      <View style={styles.playerWrapper}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Connecting to stream…</Text>
          </View>
        )}
        {activeServer ? (
          <WebView
            key={webViewKey}
            source={{ html: buildHtml(activeServer) }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            allowsFullscreenVideo
            onLoadEnd={() => setLoading(false)}
            onLoadStart={() => setLoading(true)}
          />
        ) : (
          <View style={styles.noStream}>
            <Ionicons name="warning-outline" size={40} color="#ef4444" />
            <Text style={styles.noStreamText}>No stream configured</Text>
          </View>
        )}
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.matchMeta}>
            <Text style={styles.matchTitle} numberOfLines={1}>{match.title}</Text>
            <View style={styles.liveRow}>
              {match.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              <Text style={styles.sportText}>{match.sport}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => { setWebViewKey(k => k + 1); }} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* Server Switcher */}
        {match.streams && match.streams.length > 1 && (
          <View style={styles.serverSection}>
            <Text style={styles.serverLabel}>AVAILABLE SERVERS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serverScroll}>
              {match.streams.map((server, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setActiveServerIdx(idx);
                    setWebViewKey(k => k + 1);
                  }}
                  style={[styles.serverBtn, idx === activeServerIdx && styles.serverBtnActive]}
                >
                  <View style={[styles.serverDot, idx === activeServerIdx && styles.serverDotActive]} />
                  <Text style={[styles.serverBtnText, idx === activeServerIdx && styles.serverBtnTextActive]}>
                    {server.label || `Server ${idx + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  playerWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: { flex: 1, backgroundColor: '#000' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: { color: '#52525b', fontSize: 13 },
  noStream: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  noStreamText: { color: '#ef4444', fontWeight: '600' },

  bottomPanel: {
    flex: 1, backgroundColor: '#0a0a0a', paddingTop: 16, paddingHorizontal: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  backBtn: { padding: 4, marginTop: 2 },
  matchMeta: { flex: 1 },
  matchTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#ef444420', borderWidth: 1, borderColor: '#ef444440',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#ef4444' },
  liveText: { color: '#ef4444', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sportText: { color: '#52525b', fontSize: 12, fontWeight: '600' },
  refreshBtn: { padding: 4, marginTop: 2 },

  serverSection: { marginTop: 4 },
  serverLabel: { color: '#3f3f46', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  serverScroll: { marginHorizontal: -4 },
  serverBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginHorizontal: 4,
    backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a',
  },
  serverBtnActive: {
    backgroundColor: '#22c55e15', borderColor: '#22c55e40',
  },
  serverDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  serverDotActive: { backgroundColor: '#22c55e' },
  serverBtnText: { color: '#71717a', fontWeight: '600', fontSize: 13 },
  serverBtnTextActive: { color: '#22c55e' },
});
