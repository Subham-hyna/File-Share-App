import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import React, { FC, useRef, useEffect } from 'react'
import Icon from '../global/Icon'
import { Colors, Shadows, BorderRadius, Spacing } from '../../utils/Constants'
import { useTCP } from '../../service/TCPProvider'
import { navigate } from '../../utils/NavigationUtil'
import { pickDocument, pickImage } from '../../utils/libraryHelpers'

const Options:FC<{
    isHome: boolean, 
    onFilePickedUp: (file: any) => void, 
    onMediaPickedUp: (image: any) => void
}> = ({isHome, onFilePickedUp, onMediaPickedUp }) => {
    const { isConnected } = useTCP();
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay: 300,
                useNativeDriver: true,
            })
        ]).start()
    }, [])

    const handleUniversalPicker = async (type: string) => {
        if(isHome) {
            if(isConnected) {
                navigate("Connection")
            } else {
                navigate("Send")
            }
            return;
        }

        if( type === 'images' && onMediaPickedUp) {
            pickImage(onMediaPickedUp);
        }

        if (type === 'file' && onFilePickedUp) {
            pickDocument(onFilePickedUp)
        }
    }

    const options = [
        { 
            id: 'images', 
            icon: 'images', 
            label: 'Photos', 
            color: Colors.gradient3,
            iconFamily: 'Ionicons' as const
        },
        { 
            id: 'file', 
            icon: 'musical-notes-sharp', 
            label: 'Audio', 
            color: Colors.gradient4,
            iconFamily: 'Ionicons' as const
        },
        { 
            id: 'file', 
            icon: 'folder', 
            label: 'Files', 
            color: Colors.gradient1,
            iconFamily: 'Ionicons' as const
        },
        { 
            id: 'file', 
            icon: 'contacts', 
            label: 'Contacts', 
            color: Colors.gradient2,
            iconFamily: 'MaterialIcons' as const
        }
    ]
    
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Animated.View 
                style={[
                    styles.optionsGrid,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {options.map((option, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={styles.optionItem} 
                        onPress={() => handleUniversalPicker(option.id)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                            <Icon
                                name={option.icon}
                                size={24}
                                color={Colors.surface}
                                iconFamily={option.iconFamily}
                            />
                        </View>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        fontFamily: 'Okra-Medium',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    optionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    optionItem: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.medium,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.small,
        minHeight: 100,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        textAlign: 'center',
        fontFamily: 'Okra-Medium',
    },
})

export default Options