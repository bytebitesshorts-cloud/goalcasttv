import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList,
  RefreshControl, StatusBar, ActivityIndicator, Dimensions, Animated, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchMatches, fetchConfig, type Match, type AppConfig } from '../lib/api';
import InfoModal from '../components/InfoModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPORTS = ['All', 'Football', 'Cricket', 'Basketball', 'Tennis', 'Rugby', 'Other'];

const INFO_TEXTS = {
  about: `Goalcast-TV is a leading sports streaming platform providing premium live match coverage, real-time score updates, and detailed schedules for sports enthusiasts worldwide.\n\nOur mission is to bring high-quality live sports directly to your mobile screens with zero hassle and minimum latency.\n\nThank you for supporting Goalcast-TV!`,
  privacy: `Your privacy is extremely important to us. Goalcast-TV does not collect, store, or sell any personal user data. We do not track your location, contacts, or browsing history.\n\nAny data stored locally on your device (such as your favorite channels or app preferences) remains entirely private and never leaves your device.\n\nThird-party ad networks used in the app may serve personalized advertisements. Please refer to their respective privacy policies for details.`,
  terms: `Welcome to Goalcast-TV. By using our application, you agree to comply with the following terms:\n\n1. Content Streams: All video feeds and streams are retrieved from publicly available web sources. Goalcast-TV does not host any streams or media files on its servers.\n\n2. External Links: Clicking on ads or external buttons will redirect you to third-party web content. We are not responsible for the safety, reliability, or terms of third-party websites.\n\n3. Prohibited Use: You may not attempt to reverse-engineer, modify, or distribute the app's contents without authorization.\n\nEnjoy the games!`,
};

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Sidebar & Info Modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoContent, setInfoContent] = useState('');

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
    Animated.timing(slideAnim, {
      toValue: open ? SCREEN_WIDTH - 280 : SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleInfoPress = (type: 'about' | 'privacy' | 'terms', title: string) => {
    toggleDrawer(false);
    setInfoTitle(title);
    setInfoContent(INFO_TEXTS[type]);
    setInfoModalVisible(true);
  };

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [m, c] = await Promise.all([fetchMatches(), fetchConfig()]);
    setMatches(m);
    setConfig(c);
    if (!silent) setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = activeCategory === 'All'
    ? matches
    : matches.filter(m => m.sport === activeCategory);

  const handleMatchPress = (match: Match) => {
    navigation.navigate('Ad', { match, config });
  };

  const renderMatch = ({ item: match }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleMatchPress(match)}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {match.thumbnail ? (
          <Image source={{ uri: match.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#1a2a1a', '#0a1a0a']} style={styles.thumbnail}>
            <Ionicons name="football" size={40} color="#22c55e" />
          </LinearGradient>
        )}
        {/* LIVE badge */}
        {match.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {/* Play button overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={22} color="#fff" />
          </View>
        </View>
      </View>

      {/* Match info */}
      <View style={styles.matchInfo}>
        {/* Teams */}
        <View style={styles.teamsRow}>
          {/* Team A */}
          <View style={styles.team}>
            {match.teamA?.logo ? (
              <Image source={{ uri: match.teamA.logo }} style={styles.teamLogo} resizeMode="contain" />
            ) : (
              <View style={[styles.teamLogo, styles.teamLogoFallback]}>
                <Text style={styles.teamLogoFallbackText}>{match.teamA?.name?.[0] || '?'}</Text>
              </View>
            )}
            <Text style={styles.teamName} numberOfLines={1}>{match.teamA?.name}</Text>
          </View>

          {/* VS */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.sportTag}>{match.sport}</Text>
          </View>

          {/* Team B */}
          <View style={styles.team}>
            {match.teamB?.logo ? (
              <Image source={{ uri: match.teamB.logo }} style={styles.teamLogo} resizeMode="contain" />
            ) : (
              <View style={[styles.teamLogo, styles.teamLogoFallback]}>
                <Text style={styles.teamLogoFallbackText}>{match.teamB?.name?.[0] || '?'}</Text>
              </View>
            )}
            <Text style={styles.teamName} numberOfLines={1}>{match.teamB?.name}</Text>
          </View>
        </View>

        {/* Title & Servers */}
        <Text style={styles.matchTitle} numberOfLines={1}>{match.title}</Text>
        <Text style={styles.serverCount}>{match.streams?.length || 0} server{(match.streams?.length || 0) !== 1 ? 's' : ''} available</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <LinearGradient colors={['#0a0a0a', '#0f1a0f']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logo}>
            <Ionicons name="football" size={22} color="#22c55e" />
            <Text style={styles.logoText}>Goal<Text style={{ color: '#22c55e' }}>Cast</Text></Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => load()} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={20} color="#71717a" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleDrawer(true)} style={styles.menuBtn}>
              <Ionicons name="menu" size={24} color="#22c55e" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Announcement Ticker / Bullet Notification */}
      {config?.announcementEnabled && config?.announcementText ? (
        <View style={styles.announcementBar}>
          <Ionicons name="alert-circle" size={16} color="#fbbf24" style={styles.announcementIcon} />
          <Text style={styles.announcementTextContent} numberOfLines={1}>
            {config.announcementText}
          </Text>
        </View>
      ) : null}

      {/* Category Tabs */}
      <FlatList
        data={SPORTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s}
        contentContainerStyle={styles.categoryBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveCategory(item)}
            style={[styles.categoryChip, activeCategory === item && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Match List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading matches…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="football-outline" size={60} color="#27272a" />
          <Text style={styles.emptyText}>No matches right now</Text>
          <Text style={styles.emptySubText}>Check back soon for live action!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          renderItem={renderMatch}
          contentContainerStyle={styles.matchList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true); }}
              tintColor="#22c55e"
            />
          }
        />
      )}

      {/* ── Custom Right-side Sidebar (Drawer) Overlay ── */}
      {drawerOpen && (
        <Pressable style={styles.drawerBackdrop} onPress={() => toggleDrawer(false)} />
      )}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Menu</Text>
          <TouchableOpacity onPress={() => toggleDrawer(false)} style={styles.drawerCloseBtn}>
            <Ionicons name="close" size={24} color="#71717a" />
          </TouchableOpacity>
        </View>
        <View style={styles.drawerItems}>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleInfoPress('about', 'About Us')}>
            <Ionicons name="information-circle-outline" size={20} color="#22c55e" />
            <Text style={styles.drawerItemText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleInfoPress('privacy', 'Privacy Policy')}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#22c55e" />
            <Text style={styles.drawerItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleInfoPress('terms', 'Terms & Conditions')}>
            <Ionicons name="document-text-outline" size={20} color="#22c55e" />
            <Text style={styles.drawerItemText}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.drawerFooter}>
          <Text style={styles.drawerFooterText}>GoalCast v1.0.0</Text>
        </View>
      </Animated.View>

      {/* Info Modals */}
      <InfoModal
        visible={infoModalVisible}
        title={infoTitle}
        content={infoContent}
        onClose={() => setInfoModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 50, paddingBottom: 10, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  refreshBtn: { padding: 6 },
  menuBtn: { padding: 6 },

  // Announcement Bar Style
  announcementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1917',
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  announcementIcon: { marginRight: 2 },
  announcementTextContent: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // Categories Layout (Compact Padding!)
  categoryBar: { paddingHorizontal: 12, paddingVertical: 6, gap: 6, flexDirection: 'row' },
  categoryChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a',
  },
  categoryChipActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#71717a' },
  categoryTextActive: { color: '#000' },

  matchList: { paddingHorizontal: 12, paddingBottom: 24, gap: 12 },
  matchCard: {
    backgroundColor: '#111111', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1f1f1f',
  },
  thumbnailContainer: { width: '100%', height: 180, position: 'relative' },
  thumbnail: {
    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(239,68,68,0.9)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  playOverlay: {
    position: 'absolute', bottom: 10, right: 10,
  },
  playButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(34,197,94,0.9)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#22c55e', shadowOpacity: 0.5, shadowRadius: 10,
  },

  matchInfo: { padding: 14 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  team: { flex: 1, alignItems: 'center', gap: 6 },
  teamLogo: { width: 52, height: 52, borderRadius: 26 },
  teamLogoFallback: {
    backgroundColor: '#22c55e20', borderWidth: 1, borderColor: '#22c55e30',
    alignItems: 'center', justifyContent: 'center',
  },
  teamLogoFallbackText: { color: '#22c55e', fontWeight: '700', fontSize: 20 },
  teamName: { color: '#e4e4e7', fontWeight: '700', fontSize: 13, textAlign: 'center' },
  vsContainer: { alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  vsText: { color: '#52525b', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  sportTag: {
    backgroundColor: '#18181b', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, color: '#71717a', fontSize: 10, fontWeight: '600',
  },

  matchTitle: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
  serverCount: { color: '#22c55e', fontSize: 11, fontWeight: '600', marginTop: 4 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#52525b', fontSize: 14 },
  emptyText: { color: '#52525b', fontSize: 18, fontWeight: '700' },
  emptySubText: { color: '#3f3f46', fontSize: 13 },

  // Drawer / Sidebar styles
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 280,
    backgroundColor: '#111111',
    borderLeftWidth: 1,
    borderLeftColor: '#27272a',
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 101,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    marginBottom: 20,
  },
  drawerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  drawerCloseBtn: { padding: 4 },
  drawerItems: { gap: 16, flex: 1 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  drawerItemText: { fontSize: 14, fontWeight: '600', color: '#e4e4e7' },
  drawerFooter: { paddingVertical: 20, alignItems: 'center' },
  drawerFooterText: { fontSize: 11, color: '#52525b' },
});
