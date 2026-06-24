import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
  ActivityIndicator, Alert, NativeModules, DeviceEventEmitter,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Match, StreamServer } from '../lib/api';

interface Props {
  navigation: any;
  route: { params: { match: Match } };
}

export default function PlayerScreen({ navigation, route }: Props) {
  const { match } = route.params;
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [webViewKey, setWebViewKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [triedServers, setTriedServers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInPipMode, setIsInPipMode] = useState(false);

  const activeServer: StreamServer | undefined = match.streams?.[activeServerIdx];

  // Manage Picture-in-Picture mode
  useEffect(() => {
    if (NativeModules.PipModule && NativeModules.PipModule.setEnabled) {
      NativeModules.PipModule.setEnabled(true);
    }

    const sub = DeviceEventEmitter.addListener('onPipModeChanged', (event: any) => {
      setIsInPipMode(!!event.isInPictureInPictureMode);
    });

    return () => {
      if (NativeModules.PipModule && NativeModules.PipModule.setEnabled) {
        NativeModules.PipModule.setEnabled(false);
      }
      sub.remove();
    };
  }, []);

  // Set up loading/connecting timeout for automatic failover
  useEffect(() => {
    setIsPlaying(false);
    setLoading(true);

    const timer = setTimeout(() => {
      if (!isPlaying) {
        // If it's still not playing after 10 seconds, trigger failover
        triggerFailover();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [activeServerIdx, webViewKey]);

  const triggerFailover = () => {
    if (!match.streams || match.streams.length <= 1) {
      setLoading(false);
      return;
    }
    
    const nextIdx = (activeServerIdx + 1) % match.streams.length;
    
    // Check if we have tried all servers already to avoid infinite loops
    if (triedServers.includes(nextIdx) && triedServers.length >= match.streams.length) {
      Alert.alert(
        "Stream Offline",
        "All available video servers are currently offline or closed. Please try again later.",
        [{ text: "OK" }]
      );
      setLoading(false);
      return;
    }

    setTriedServers(prev => [...prev, activeServerIdx]);
    setActiveServerIdx(nextIdx);
    setWebViewKey(k => k + 1);
  };

  const handleServerChange = (idx: number) => {
    setTriedServers([idx]);
    setActiveServerIdx(idx);
    setWebViewKey(k => k + 1);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'playing') {
        setIsPlaying(true);
        setLoading(false);
      } else if (data.type === 'error') {
        triggerFailover();
      }
    } catch (e) {
      // Ignore invalid JSON messages
    }
  };

  // Build the HTML to embed the stream (supports HLS & DASH)
  const buildHtml = (server: StreamServer) => {
    if (server.embedCode) {
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
      return `<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    video { width: 100%; height: 100%; object-fit: contain; background: #000; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/dashjs@latest/dist/dash.all.min.js"></script>
</head>
<body>
  <video id="v" controls autoplay playsinline></video>
  <script>
    var v = document.getElementById('v');
    var src = '${server.url}';
    
    function sendMsg(type) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type }));
      }
    }

    v.addEventListener('playing', function() {
      sendMsg('playing');
    });

    v.addEventListener('error', function() {
      sendMsg('error');
    });

    if (src.toLowerCase().indexOf('.mpd') > -1) {
      try {
        var player = dashjs.MediaPlayer().create();
        player.initialize(v, src, true);
        player.on(dashjs.MediaPlayer.events.ERROR, function(e) {
          sendMsg('error');
        });
      } catch(e) {
        sendMsg('error');
      }
    } else if (Hls.isSupported() && (src.toLowerCase().indexOf('.m3u8') > -1 || src.indexOf('rtmp') === -1)) {
      try {
        var hls = new Hls({ lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(v);
        hls.on(Hls.Events.MANIFEST_PARSED, function() { 
          v.play().catch(function() { sendMsg('error'); }); 
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data.fatal) {
            sendMsg('error');
          }
        });
      } catch(e) {
        sendMsg('error');
      }
    } else {
      v.src = src;
      v.play().catch(function() { sendMsg('error'); });
    }
  </script>
</body></html>`;
    }
    return '<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>No stream available</p></body></html>';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />

      {/* Full-Screen Video Player */}
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
            onMessage={handleMessage}
            onError={() => triggerFailover()}
            onHttpError={() => triggerFailover()}
          />
        ) : (
          <View style={styles.noStream}>
            <Ionicons name="warning-outline" size={40} color="#ef4444" />
            <Text style={styles.noStreamText}>No stream configured</Text>
          </View>
        )}
      </View>

      {/* Top Overlay controls (Shifted servers inside the player overlay) */}
      {!isInPipMode && (
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.5)', 'transparent']}
          style={styles.topOverlay}
          pointerEvents="box-none"
        >
          {/* Header Row */}
          <View style={styles.headerRow} pointerEvents="box-none">
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.matchMeta} pointerEvents="none">
              <Text style={styles.matchTitle} numberOfLines={1}>{match.title}</Text>
              <Text style={styles.sportText}>🏆 {match.sport}{match.league ? ` || ${match.league}` : ''}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  if (NativeModules.PipModule && NativeModules.PipModule.enterPipMode) {
                    NativeModules.PipModule.enterPipMode();
                  }
                }}
                style={styles.pipBtn}
              >
                <Ionicons name="open-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setWebViewKey(k => k + 1); }} style={styles.refreshBtn}>
                <Ionicons name="refresh" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Horizontally scrollable list of servers inside the player overlay */}
          {match.streams && match.streams.length > 0 && (
            <View style={styles.serverSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serverScroll}>
                {match.streams.map((server, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleServerChange(idx)}
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
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  playerWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1,
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
  loadingText: { color: '#71717a', fontSize: 13, fontWeight: '600' },
  noStream: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  noStreamText: { color: '#ef4444', fontWeight: '600' },

  // Top Overlay controls
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 45,
    paddingBottom: 25,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  matchMeta: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  matchTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sportText: {
    color: '#ca8a04',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pipBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // Server switch inside player overlay
  serverSection: {
    marginTop: 14,
  },
  serverScroll: {
    gap: 8,
    paddingRight: 16,
  },
  serverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.5)',
  },
  serverBtnActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#71717a',
  },
  serverDotActive: {
    backgroundColor: '#22c55e',
  },
  serverBtnText: {
    color: '#a1a1aa',
    fontWeight: '700',
    fontSize: 12,
  },
  serverBtnTextActive: {
    color: '#22c55e',
  },
});
