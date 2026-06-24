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

const getRemainingTime = (endsAt?: string, currentMs: number = Date.now()) => {
  if (!endsAt) return '';
  const diff = new Date(endsAt).getTime() - currentMs;
  if (diff <= 0) return 'Ended';
  
  const secs = Math.floor(diff / 1000);
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;
  
  const pad = (num: number) => String(num).padStart(2, '0');
  
  return `${pad(hours)}:${pad(mins)}:${pad(remainingSecs)}`;
};

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentTime, setCurrentTime] = useState(Date.now());

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return matches.length;
    return matches.filter(m => m.sport === category).length;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'All': return 'sync-outline';
      case 'Football': return 'football-outline';
      case 'Cricket': return 'trophy-outline';
      case 'Basketball': return 'basketball-outline';
      case 'Tennis': return 'tennisball-outline';
      case 'Rugby': return 'american-football-outline';
      default: return 'apps-outline';
    }
  };

  const filtered = (activeCategory === 'All'
    ? matches
    : matches.filter(m => m.sport === activeCategory)
  ).filter(m => {
    if (m.isTemporary && m.endsAt) {
      return new Date(m.endsAt).getTime() > currentTime;
    }
    return true;
  }).sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return 0;
  });

  const handleMatchPress = (match: Match) => {
    navigation.navigate('Ad', { match, config });
  };

  const renderMatch = ({ item: match }: { item: Match }) => {
    const remaining = match.isTemporary ? getRemainingTime(match.endsAt, currentTime) : '';
    const hasThumbnail = !!match.thumbnail;

    return (
      <TouchableOpacity
        style={[styles.matchCard, !hasThumbnail && styles.compactCard]}
        onPress={() => handleMatchPress(match)}
        activeOpacity={0.85}
      >
        {/* Card Header (Matches the reference image style) */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.leagueText} numberOfLines={1}>
              🏆 {match.sport}{match.league ? ` || ${match.league}` : ''}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {match.isTemporary && remaining !== 'Ended' && remaining !== '' && (
              <Text style={styles.countdownText}>{remaining}</Text>
            )}
            {match.isLive && (
              <View style={styles.liveBadgeCapsule}>
                <View style={styles.liveDotWhite} />
                <Text style={styles.liveTextWhite}>LIVE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Thumbnail if present */}
        {hasThumbnail && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: match.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
            {/* Play button overlay */}
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={22} color="#fff" />
              </View>
            </View>
          </View>
        )}

        {/* Card Body - Teams VS Layout */}
        <View style={[styles.vsLayoutRow, hasThumbnail && styles.vsLayoutRowWithThumbnail]}>
          {/* Team A */}
          <View style={styles.teamLeft}>
            {match.teamA?.logo ? (
              <Image source={{ uri: match.teamA.logo }} style={styles.circularLogo} resizeMode="contain" />
            ) : (
              <View style={styles.circularLogoFallback}>
                <Text style={styles.teamLogoFallbackText}>{match.teamA?.name?.[0] || '?'}</Text>
              </View>
            )}
            <Text style={styles.teamText} numberOfLines={1}>{match.teamA?.name}</Text>
          </View>

          {/* VS */}
          <Text style={styles.vsTextCenter}>VS</Text>

          {/* Team B */}
          <View style={styles.teamRight}>
            {match.teamB?.logo ? (
              <Image source={{ uri: match.teamB.logo }} style={styles.circularLogo} resizeMode="contain" />
            ) : (
              <View style={styles.circularLogoFallback}>
                <Text style={styles.teamLogoFallbackText}>{match.teamB?.name?.[0] || '?'}</Text>
              </View>
            )}
            <Text style={styles.teamText} numberOfLines={1}>{match.teamB?.name}</Text>
          </View>
        </View>

        {/* Title & Servers under VS layout */}
        <View style={styles.matchMetaInfo}>
          <Text style={styles.matchTitle} numberOfLines={1}>{match.title}</Text>
          <Text style={styles.serverCount}>{match.streams?.length || 0} server{(match.streams?.length || 0) !== 1 ? 's' : ''} available</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <LinearGradient colors={['#0a0a0a', '#0f1a0f']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logo}>
            <Ionicons name="football" size={16} color="#22c55e" />
            <Text style={styles.logoText}>Goal<Text style={{ color: '#22c55e' }}>Cast</Text></Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => load()} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={14} color="#71717a" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleDrawer(true)} style={styles.menuBtn}>
              <Ionicons name="menu" size={17} color="#22c55e" />
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
        renderItem={({ item }) => {
          const count = getCategoryCount(item);
          const icon = getCategoryIcon(item);
          const isActive = activeCategory === item;
          return (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={styles.categoryItem}
              activeOpacity={0.75}
            >
              <View style={[styles.categoryCircle, isActive && styles.categoryCircleActive]}>
                <Ionicons name={icon as any} size={20} color={isActive ? '#000' : '#a1a1aa'} />
                {count > 0 && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{count}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
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
  header: { paddingTop: 24, paddingBottom: 2, paddingHorizontal: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  refreshBtn: { padding: 4 },
  menuBtn: { padding: 4 },

  // Announcement Bar Style
  announcementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1917',
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
    paddingVertical: 6,
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

  // Categories Layout (Circular Icon Badges!)
  categoryBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 12, flexDirection: 'row' },
  categoryItem: { alignItems: 'center', gap: 6 },
  categoryCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  categoryCircleActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  categoryBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0a0a0a',
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  categoryLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },

  matchList: { paddingHorizontal: 10, paddingBottom: 20, gap: 10 },
  matchCard: {
    backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1f1f1f',
  },
  thumbnailContainer: { width: '100%', height: 150, position: 'relative' },
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(34,197,94,0.9)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#22c55e', shadowOpacity: 0.5, shadowRadius: 8,
  },

  matchInfo: { padding: 10 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  team: { flex: 1, alignItems: 'center', gap: 4 },
  teamLogo: { width: 44, height: 44, borderRadius: 22 },
  teamLogoFallback: {
    backgroundColor: '#22c55e20', borderWidth: 1, borderColor: '#22c55e30',
    alignItems: 'center', justifyContent: 'center',
  },
  teamLogoFallbackText: { color: '#22c55e', fontWeight: '700', fontSize: 18 },
  teamName: { color: '#e4e4e7', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  vsContainer: { alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  vsText: { color: '#52525b', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  sportTag: {
    backgroundColor: '#18181b', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, color: '#71717a', fontSize: 10, fontWeight: '600',
  },

  matchTitle: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
  serverCount: { color: '#22c55e', fontSize: 11, fontWeight: '600', marginTop: 4 },

  compactCard: {
    backgroundColor: '#121824',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f293d',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1f293d',
    paddingBottom: 10,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leagueText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  countdownText: {
    color: '#00f5ff',
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  liveBadgeCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  liveDotWhite: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveTextWhite: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vsLayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  vsLayoutRowWithThumbnail: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  teamRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  circularLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f293d',
  },
  circularLogoFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22c55e20',
    borderWidth: 1,
    borderColor: '#22c55e30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    flexShrink: 1,
  },
  vsTextCenter: {
    color: '#94a3b8',
    fontWeight: '800',
    fontSize: 13,
    width: 40,
    textAlign: 'center',
  },
  matchMetaInfo: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#1f293d',
    paddingTop: 8,
    marginTop: 4,
  },

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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#52525b', fontSize: 14 },
  emptyText: { color: '#52525b', fontSize: 18, fontWeight: '700' },
  emptySubText: { color: '#3f3f46', fontSize: 13 },
});
