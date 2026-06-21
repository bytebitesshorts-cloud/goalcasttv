import React from 'react';
import { View, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

const CHANNELS_URL = 'https://goalcast-tv.vercel.app';

export default function ChannelsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <WebView
        source={{ uri: CHANNELS_URL }}
        style={{ flex: 1 }}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
      />
    </View>
  );
}
