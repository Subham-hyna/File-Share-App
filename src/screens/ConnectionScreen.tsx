import { View, Text, TouchableOpacity, FlatList, Platform, ActivityIndicator, StyleSheet, StatusBar } from 'react-native'
import React, { FC, useState, useEffect } from 'react'
import { useTCP } from '../service/TCPProvider'
import Icon from '../components/global/Icon'
import { resetAndNavigate } from '../utils/NavigationUtil'
import LinearGradient from 'react-native-linear-gradient'
import Options from '../components/home/Options'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { Colors, Shadows, BorderRadius, Spacing } from '../utils/Constants'
import { formatFileSize } from '../utils/libraryHelpers'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ConnectionScreen: FC = () => {

  const {
    isConnected,
    connectedDevice,
    disconnect,
    sendFileAck,
    sentFiles,
    receivedFiles,
    totalReceivedBytes,
    totalSentBytes
  } = useTCP();

  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVED'>('SENT')

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case '.mp3':
        return <Icon name="musical-notes" size={16} color="blue" iconFamily="Ionicons" />;
      case '.mp4':
        return <Icon name="videocam" size={16} color="green" iconFamily="Ionicons" />;
      case '.jpg':
        return <Icon name="image" size={16} color="orange" iconFamily="Ionicons" />;
      case '.pdf':
        return <Icon name="document" size={16} color="red" iconFamily="Ionicons" />;
      default:
        return <Icon name="folder" size={16} color="gray" iconFamily="Ionicons" />;
    }
  }

  const onMediaPickedUp = (image: any) => {
    console.log('Picked image:', image);
    sendFileAck(image, 'image')
  };

  const onFilePickedUp = (file: any) => {
    console.log('Picked file:', file);
    sendFileAck(file, 'file')
  };

  useEffect(() => {
    if (!isConnected) {
      resetAndNavigate('Home')
    }
  }, [isConnected])

  const handletabChange = (tab: 'SENT' | 'RECEIVED') => {
    setActiveTab(tab)
  }

  const renderItem = ({item}: {item: any}) => {
    return (
      <View style={styles.fileItem}>
        <View style={styles.fileInfoContainer}>
          {renderThumbnail(item?.mimeType)}
          <View style={styles.fileDetails}>
            <Text style={styles.fileName}>{item?.name}</Text>
            <Text style={styles.fileInfo}>{item?.mimeType} • {item?.size}</Text>
          </View>
        </View>

        {item?.available ? (
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => {
              const normalisedPath = 
                Platform.OS == 'ios' ? `file://${item?.uri}` : item?.uri

                if(Platform.OS == 'ios') {
                  ReactNativeBlobUtil.ios
                    .openDocument(normalisedPath)
                    .then(() => console.log('File opened'))
                    .catch((e) => console.log('Error opening file', e))
                } else {
                  ReactNativeBlobUtil.android
                    .actionViewIntent(normalisedPath, '*/*')
                    .then(() => console.log('File opened'))
                    .catch((e) => console.log('Error opening file', e))
                }
            }}
          > 
            <Text style={styles.openButtonText}>Open</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.downloadingContainer}>
            <ActivityIndicator size='small' color={Colors.primary} />
            <Text style={styles.downloadingText}>Downloading...</Text>
          </View>
        )}
      </View>
    )
  }

  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient3, Colors.info]}
        style={styles.gradientContainer}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <View style={styles.connectionInfo}>
              <Text style={styles.connectionLabel}>Connected with</Text>
              <Text style={styles.deviceName}>{connectedDevice || 'Unknown Device'}</Text>
            </View>
            <TouchableOpacity style={styles.disconnectButton} onPress={()=> disconnect()}>
              <Icon 
                name='close-circle'
                size={20}
                color={Colors.error}
                iconFamily='Ionicons'
              />
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Options 
              onFilePickedUp={onFilePickedUp}
              onMediaPickedUp={onMediaPickedUp}
              isHome={false}
            />
            
            <View style={styles.fileContainer}>
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'SENT' && styles.activeTab
                  ]}
                  onPress={() => handletabChange('SENT')}
                >
                  <Icon
                    name='cloud-upload'
                    size={18}
                    color={activeTab === 'SENT' ? Colors.surface : Colors.textSecondary}
                    iconFamily='Ionicons'
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'SENT' && styles.activeTabText
                  ]}>SENT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'RECEIVED' && styles.activeTab
                  ]}
                  onPress={() => handletabChange('RECEIVED')}
                >
                  <Icon
                    name='cloud-download'
                    size={18}
                    color={activeTab === 'RECEIVED' ? Colors.surface : Colors.textSecondary}
                    iconFamily='Ionicons'
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'RECEIVED' && styles.activeTabText
                  ]}>RECEIVED</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  {formatFileSize(
                    (activeTab === 'SENT'
                      ? totalSentBytes
                      : totalReceivedBytes
                    ) || 0
                  )}
                  {' / '}
                  {activeTab === 'SENT'
                    ? formatFileSize(
                      sentFiles?.reduce(
                        (total: number, file: any) => total + file.size,
                        0
                      ),
                    )
                    :
                    formatFileSize(
                      receivedFiles?.reduce(
                        (total: number, file: any) => total + file.size,
                        0
                      )
                    )
                  }
                </Text>
              </View>

              {
                (activeTab === 'SENT'
                  ? sentFiles?.length
                  : receivedFiles?.length
                ) > 0 ? (
                  <FlatList
                    data={activeTab === 'SENT' ? sentFiles : receivedFiles}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.fileList}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <Icon
                      name={activeTab === 'SENT' ? 'cloud-upload-outline' : 'cloud-download-outline'}
                      size={48}
                      color={Colors.textTertiary}
                      iconFamily='Ionicons'
                    />
                    <Text style={styles.noDataText}>
                      {activeTab === 'SENT'
                        ? 'No files sent yet.'
                        : 'No files received yet.'}
                    </Text>
                  </View>
                )
              }
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => resetAndNavigate('Home')}
            style={styles.backButton}
          >
            <Icon
              name="arrow-back"
              iconFamily="Ionicons"
              size={20}
              color={Colors.text}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Okra-Regular',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'Okra-Medium',
    marginTop: Spacing.xs,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.medium,
    gap: Spacing.xs,
  },
  disconnectText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Okra-Medium',
  },
  content: {
    flex: 1,
    marginTop: Spacing.md,
  },
  fileContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.small,
    gap: Spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    fontFamily: 'Okra-Medium',
  },
  activeTabText: {
    color: Colors.surface,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.small,
  },
  statsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Okra-Medium',
  },
  fileList: {
    paddingBottom: Spacing.md,
  },
  fileItem: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.small,
  },
  fileInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    fontFamily: 'Okra-Medium',
    marginBottom: Spacing.xs,
  },
  fileInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Okra-Regular',
  },
  openButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.small,
  },
  openButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Okra-Medium',
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  downloadingText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Okra-Regular',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  noDataText: {
    fontSize: 16,
    color: Colors.textTertiary,
    fontFamily: 'Okra-Regular',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
    zIndex: 5,
  },
})

export default ConnectionScreen