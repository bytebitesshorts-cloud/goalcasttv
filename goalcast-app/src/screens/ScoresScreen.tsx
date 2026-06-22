import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const SCORES_URL = 'https://goalcast-tv.vercel.app/scores';

export default function ScoresScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <WebView
        source={{ uri: SCORES_URL }}
        style={styles.webview}
        javaScriptEnabled
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 40, // Space for the notch/status bar
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});
