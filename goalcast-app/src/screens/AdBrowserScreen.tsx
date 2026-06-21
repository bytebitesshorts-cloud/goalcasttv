import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

interface Props {
  navigation: any;
  route: { params: { url: string; title: string } };
}

export default function AdBrowserScreen({ navigation, route }: Props) {
  const { url, title } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#111', paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  closeBtn: { padding: 4 },
  title: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 14 },
});
