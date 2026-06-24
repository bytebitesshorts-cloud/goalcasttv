import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

export default function AppUpdater() {
  const [updateInfo, setUpdateInfo] = useState<{
    versionCode: number;
    versionName: string;
    apkUrl: string;
    releaseNotes: string;
    forceUpdate: boolean;
  } | null>(null);

  const [visible, setVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadResumable, setDownloadResumable] = useState<FileSystem.DownloadResumable | null>(null);

  useEffect(() => {
    async function checkUpdate() {
      if (__DEV__ || Platform.OS !== 'android') return;

      try {
        // Fetch current setting configurations which contains app update info
        // Wait, they can host a version.json under goalcast.tv/version.json
        const response = await fetch('https://goalcast.tv/version.json');
        if (!response.ok) return;
        const data = await response.json();

        const currentVersionCode = Constants.expoConfig?.android?.versionCode || 1;

        if (data.versionCode > currentVersionCode) {
          setUpdateInfo({
            versionCode: data.versionCode,
            versionName: data.versionName,
            apkUrl: data.apkUrl,
            releaseNotes: data.releaseNotes || 'A new update is available with new features and stability improvements.',
            forceUpdate: !!data.forceUpdate,
          });
          setVisible(true);
        }
      } catch (error) {
        console.warn('Update check failed:', error);
      }
    }

    checkUpdate();
  }, []);

  const handleDownload = async () => {
    if (!updateInfo) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    const downloadDest = `${FileSystem.documentDirectory}update.apk`;

    // Ensure previous file is deleted
    try {
      const fileInfo = await FileSystem.getInfoAsync(downloadDest);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(downloadDest);
      }
    } catch (_) {}

    const callback = (downloadProgressData: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => {
      const progress = downloadProgressData.totalBytesWritten / downloadProgressData.totalBytesExpectedToWrite;
      setDownloadProgress(Math.max(0, Math.min(progress, 1)));
    };

    const resumable = FileSystem.createDownloadResumable(
      updateInfo.apkUrl,
      downloadDest,
      {},
      callback
    );

    setDownloadResumable(resumable);

    try {
      const result = await resumable.downloadAsync();
      setIsDownloading(false);

      if (result && result.uri) {
        const contentUri = await FileSystem.getContentUriAsync(result.uri);
        
        // Launch Android intent installer
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
          type: 'application/vnd.android.package-archive',
        });
      } else {
        throw new Error('Download returned empty result');
      }
    } catch (error) {
      setIsDownloading(false);
      Alert.alert(
        'Download Failed',
        'There was an error downloading the update. Please try again or download manually.',
        [
          { text: 'Try Again', onPress: handleDownload },
          { text: 'Download manually', onPress: () => Linking.openURL(updateInfo.apkUrl) },
          ...(!updateInfo.forceUpdate ? [{ text: 'Cancel', style: 'cancel' as const }] : []),
        ]
      );
    }
  };

  const handleClose = () => {
    if (updateInfo?.forceUpdate) {
      Alert.alert('Update Required', 'This update is mandatory to continue using the application.');
      return;
    }
    setVisible(false);
  };

  if (!visible || !updateInfo) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="cloud-download-outline" size={24} color="#22c55e" style={styles.icon} />
              <Text style={styles.title}>Update Available ({updateInfo.versionName})</Text>
            </View>
            {!updateInfo.forceUpdate && !isDownloading && (
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={styles.body}>
            {!isDownloading ? (
              <>
                <Text style={styles.subtitle}>What's New:</Text>
                <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>

                <TouchableOpacity style={styles.updateBtn} onPress={handleDownload}>
                  <Text style={styles.updateBtnText}>Update Now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color="#22c55e" style={{ marginBottom: 15 }} />
                <Text style={styles.downloadingText}>Downloading update...</Text>
                
                {/* Progress Bar Background */}
                <View style={styles.progressBarBg}>
                  {/* Progress Fill */}
                  <View style={[styles.progressBarFill, { width: `${downloadProgress * 100}%` }]} />
                </View>
                
                <Text style={styles.percentageText}>
                  {Math.round(downloadProgress * 100)}% Complete
                </Text>
                <Text style={styles.warningText}>Please do not close or exit the app.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#111111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    backgroundColor: '#161616',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e4e4e7',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
    marginBottom: 24,
  },
  updateBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  downloadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e4e4e7',
    marginBottom: 15,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#27272a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
  },
});
