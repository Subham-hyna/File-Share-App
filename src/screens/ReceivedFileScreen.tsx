import { View, Text, Platform, Image, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput, Share, Linking, StatusBar } from 'react-native'
import React, { FC, useState, useEffect, useCallback } from 'react'
import RNFS from 'react-native-fs'
import ReactNativeBlobUtil from 'react-native-blob-util'
import Icon from '../components/global/Icon'
import { commonStyles } from '../styles/CommonStyles'
import { Colors, screenWidth, Shadows, BorderRadius, Spacing } from '../utils/Constants'
import { StyleSheet } from 'react-native'
import { goBack } from '../utils/NavigationUtil'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'

interface FileItem {
    id: string
    name: string
    uri: string
    size: number
    mimeType: string
    modificationTime: number
}

const ReceivedFileScreen: FC = () => {
    const [receivedFiles, setReceivedFiles] = useState<FileItem[]>([])
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('all')

    const getFilesFromDirectory = async () => {
        setIsLoading(true)

        const platformPath = Platform.OS === 'android' ?
        `${RNFS.DownloadDirectoryPath}/FileShare` : `${RNFS.DocumentDirectoryPath}/FileShare`

        try {
            const exists = await RNFS.exists(platformPath)
            if (!exists) {
                await RNFS.mkdir(platformPath)
                setReceivedFiles([])
                setFilteredFiles([])
                setIsLoading(false)
                return
            }
            const files = await RNFS.readDir(platformPath)

            const formattedFiles: FileItem[] = files
                .filter(file => file.isFile())
                .map((file) => ({
                    id: file.name,
                    name: file.name,
                    uri: file.path,
                    size: file.size,
                    mimeType: file.name.split('.').pop()?.toLowerCase() || 'unknown',
                    modificationTime: file.mtime ? new Date(file.mtime).getTime() : Date.now()
                }))
                .sort((a, b) => b.modificationTime - a.modificationTime)

            setReceivedFiles(formattedFiles)
            setFilteredFiles(formattedFiles)
        } catch (error) {
            console.log('Error reading directory:', error)
            setReceivedFiles([])
            setFilteredFiles([])
        } finally {
            setIsLoading(false)
        }
    }

    const filterFiles = useCallback(() => {
        let filtered = receivedFiles

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(file => 
                file.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply type filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(file => {
                switch (selectedFilter) {
                    case 'images':
                        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.mimeType)
                    case 'documents':
                        return ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(file.mimeType)
                    case 'audio':
                        return ['mp3', 'wav', 'aac', 'm4a', 'flac'].includes(file.mimeType)
                    case 'video':
                        return ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(file.mimeType)
                    default:
                        return true
                }
            })
        }

        setFilteredFiles(filtered)
    }, [receivedFiles, searchQuery, selectedFilter])

    useEffect(() => {
        filterFiles()
    }, [filterFiles])

    useEffect(() => {
        getFilesFromDirectory()
    }, [])

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const renderThumbnail = (file: FileItem) => {
        const { mimeType, uri } = file
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(mimeType)) {
            return (
                <Image 
                    source={{ uri: `file://${uri}` }} 
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
            )
        }

        const getIcon = () => {
            switch (mimeType) {
                case 'mp3':
                case 'wav':
                case 'aac':
                case 'm4a':
                case 'flac':
                    return { name: 'musical-notes', family: 'Ionicons' as const }
                case 'mp4':
                case 'avi':
                case 'mov':
                case 'wmv':
                case 'flv':
                    return { name: 'videocam', family: 'Ionicons' as const }
                case 'pdf':
                    return { name: 'document-text', family: 'Ionicons' as const }
                case 'doc':
                case 'docx':
                    return { name: 'document', family: 'Ionicons' as const }
                case 'txt':
                    return { name: 'document-text-outline', family: 'MaterialCommunityIcons' as const }
                case 'zip':
                case 'rar':
                case '7z':
                    return { name: 'archive', family: 'MaterialCommunityIcons' as const }
                default:
                    return { name: 'document', family: 'Ionicons' as const }
            }
        }

        const icon = getIcon()
        return (
            <View style={styles.thumbnailIcon}>
                <Icon 
                    name={icon.name} 
                    size={24} 
                    color={Colors.primary} 
                    iconFamily={icon.family}
                />
            </View>
        )
    }

    const openFile = async (file: FileItem) => {
        try {
            const normalisedPath = Platform.OS === 'ios' ? `file://${file.uri}` : file.uri
            
            if (Platform.OS === 'ios') {
                await ReactNativeBlobUtil.ios
                    .openDocument(normalisedPath)
                    .then(() => console.log('File opened successfully'))
                    .catch((error) => {
                        console.log('Error opening file:', error)
                        Alert.alert(
                            'Cannot Open File',
                            'No app found to open this file type. Make sure you have an appropriate app installed.',
                            [{ text: 'OK' }]
                        )
                    })
            } else {
                // For Android, use the specific MIME type or fall back to */*
                const getMimeType = (extension: string) => {
                    switch (extension.toLowerCase()) {
                        case 'pdf':
                            return 'application/pdf'
                        case 'jpg':
                        case 'jpeg':
                            return 'image/jpeg'
                        case 'png':
                            return 'image/png'
                        case 'gif':
                            return 'image/gif'
                        case 'mp4':
                            return 'video/mp4'
                        case 'mp3':
                            return 'audio/mpeg'
                        case 'wav':
                            return 'audio/wav'
                        case 'doc':
                            return 'application/msword'
                        case 'docx':
                            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        case 'txt':
                            return 'text/plain'
                        case 'zip':
                            return 'application/zip'
                        case 'rar':
                            return 'application/x-rar-compressed'
                        default:
                            return '*/*'
                    }
                }
                
                const mimeType = getMimeType(file.mimeType)
                
                await ReactNativeBlobUtil.android
                    .actionViewIntent(normalisedPath, mimeType)
                    .then(() => console.log('File opened successfully'))
                    .catch((error) => {
                        console.log('Error opening file:', error)
                        Alert.alert(
                            'Cannot Open File',
                            'No app found to open this file type. You can install an appropriate app from the Play Store.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                    text: 'Open Play Store', 
                                    onPress: () => {
                                        const playStoreQuery = getPlayStoreQuery(file.mimeType)
                                        Linking.openURL(`https://play.google.com/store/search?q=${playStoreQuery}&c=apps`)
                                    }
                                }
                            ]
                        )
                    })
            }
        } catch (error) {
            console.log('Error opening file:', error)
            Alert.alert('Error', 'Failed to open file.')
        }
    }

    const getPlayStoreQuery = (extension: string) => {
        switch (extension.toLowerCase()) {
            case 'pdf':
                return 'pdf viewer'
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return 'image viewer'
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
            case 'flv':
                return 'video player'
            case 'mp3':
            case 'wav':
            case 'aac':
            case 'm4a':
            case 'flac':
                return 'music player'
            case 'doc':
            case 'docx':
                return 'word document viewer'
            case 'txt':
                return 'text editor'
            case 'zip':
            case 'rar':
            case '7z':
                return 'zip file manager'
            default:
                return 'file manager'
        }
    }

    const shareFile = async (file: FileItem) => {
        try {
            await Share.share({
                url: file.uri,
                title: file.name,
                message: `Sharing ${file.name}`,
            })
        } catch (error) {
            console.log('Error sharing file:', error)
            Alert.alert('Error', 'Failed to share file.')
        }
    }

    const deleteFile = (file: FileItem) => {
        Alert.alert(
            'Delete File',
            `Are you sure you want to delete "${file.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await RNFS.unlink(file.uri)
                            getFilesFromDirectory()
                        } catch (error) {
                            console.log('Error deleting file:', error)
                            Alert.alert('Error', 'Failed to delete file.')
                        }
                    }
                }
            ]
        )
    }

    const showFileActions = (file: FileItem) => {
        Alert.alert(
            file.name,
            `Size: ${formatFileSize(file.size)}\nType: ${file.mimeType.toUpperCase()}`,
            [
                { text: 'Open', onPress: () => openFile(file) },
                { text: 'Share', onPress: () => shareFile(file) },
                { text: 'Delete', onPress: () => deleteFile(file), style: 'destructive' },
                { text: 'Cancel', style: 'cancel' }
            ]
        )
    }

    const filterButtons = [
        { key: 'all', label: 'All', icon: 'apps' },
        { key: 'images', label: 'Images', icon: 'image' },
        { key: 'documents', label: 'Documents', icon: 'document' },
        { key: 'audio', label: 'Audio', icon: 'musical-notes' },
        { key: 'video', label: 'Video', icon: 'videocam' }
    ]

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="folder-open" size={64} color={Colors.textTertiary} iconFamily="Ionicons" />
            <Text style={styles.emptyStateTitle}>No Files Found</Text>
            <Text style={styles.emptyStateSubtitle}>
                {searchQuery ? 'No files match your search' : 'You haven\'t received any files yet'}
            </Text>
        </View>
    )

    const renderFileItem = ({ item }: { item: FileItem }) => (
        <TouchableOpacity 
            style={styles.fileItem}
            onPress={() => openFile(item)}
            activeOpacity={0.7}
        >
            {renderThumbnail(item)}
            <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
                <Text style={styles.fileDate}>
                    {new Date(item.modificationTime).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                    e.stopPropagation()
                    showFileActions(item)
                }}
            >
                <Icon name="ellipsis-vertical" size={16} color={Colors.text} iconFamily="Ionicons" />
            </TouchableOpacity>
        </TouchableOpacity>
    )

    return (
        <View style={[commonStyles.baseContainer, {paddingTop: 50}]}>
            {/* Header */}
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Icon name="arrow-back" size={20} color={Colors.text} iconFamily="Ionicons" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Received Files</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={16} color={Colors.text} iconFamily="Ionicons" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search files..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Colors.text}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close" size={16} color={Colors.text} iconFamily="Ionicons" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Filter Buttons */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                {filterButtons.map(filter => (
                    <TouchableOpacity
                        key={filter.key}
                        style={[
                            styles.filterButton,
                            selectedFilter === filter.key && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedFilter(filter.key)}
                    >
                        <Icon 
                            name={filter.icon} 
                            size={16} 
                            color={selectedFilter === filter.key ? Colors.background : Colors.text} 
                            iconFamily="Ionicons" 
                        />
                        <Text style={[
                            styles.filterButtonText,
                            selectedFilter === filter.key && styles.filterButtonTextActive
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Files List */}
            <ScrollView
                style={styles.filesList}
                contentContainerStyle={filteredFiles.length === 0 ? styles.emptyScrollContent : undefined}
                showsVerticalScrollIndicator={false}
            >
                {filteredFiles.length === 0 ? (
                    renderEmptyState()
                ) : (
                    filteredFiles.map(file => (
                        <View key={file.id}>
                            {renderFileItem({ item: file })}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Files Count */}
            {filteredFiles.length > 0 && (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
        borderRadius: 8,
        backgroundColor: Colors.background,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Okra-Bold',
        color: Colors.text,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: 'Okra-Regular',
        color: Colors.text,
    },
    filterContainer: {
        paddingHorizontal: 20,
        marginBottom: 5,
    },
    filterContent: {
        paddingRight: 20,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        height: 36,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        marginRight: 10,
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    filterButtonText: {
        marginLeft: 5,
        fontSize: 14,
        fontFamily: 'Okra-Medium',
        color: Colors.text,
    },
    filterButtonTextActive: {
        color: Colors.background,
    },
    filesList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    emptyScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        shadowColor: Colors.text,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    thumbnailIcon: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileInfo: {
        flex: 1,
        marginLeft: 12,
    },
    fileName: {
        fontSize: 16,
        fontFamily: 'Okra-Medium',
        color: Colors.text,
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 12,
        fontFamily: 'Okra-Regular',
        color: Colors.primary,
        marginBottom: 2,
    },
    fileDate: {
        fontSize: 11,
        fontFamily: 'Okra-Regular',
        color: '#999',
    },
    actionButton: {
        padding: 10,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
        minHeight: 300,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontFamily: 'Okra-Bold',
        color: Colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        fontFamily: 'Okra-Regular',
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Okra-Regular',
        color: '#999',
        textAlign: 'center',
    },
})

export default ReceivedFileScreen