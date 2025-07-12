import { StyleSheet } from "react-native";
import { Colors, screenWidth, Shadows, BorderRadius, Spacing } from "../utils/Constants";

export const commonStyles = StyleSheet.create({
    baseContainer: {
        flex: 1,
        backgroundColor: Colors.background
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background
    },
    img: {
        width: screenWidth * 0.5,
        height: screenWidth * 0.5,
        resizeMode: 'contain'
    },
    flexRowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    flexRowGap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs
    },
    flexColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: BorderRadius.medium,
        padding: Spacing.md,
        ...Shadows.medium,
        marginVertical: Spacing.sm,
        marginHorizontal: Spacing.md
    },
    cardSmall: {
        backgroundColor: Colors.cardBackground,
        borderRadius: BorderRadius.small,
        padding: Spacing.sm,
        ...Shadows.small,
        marginVertical: Spacing.xs,
        marginHorizontal: Spacing.sm
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.medium,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.small,
    },
    buttonText: {
        color: Colors.surface,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Okra-Medium'
    },
    buttonSecondary: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.medium,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.small,
    },
    buttonSecondaryText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Okra-Medium'
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
        fontFamily: 'Okra-Bold',
        marginBottom: Spacing.sm
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        fontFamily: 'Okra-Medium',
        marginBottom: Spacing.xs
    },
    body: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontFamily: 'Okra-Regular',
        lineHeight: 24
    },
    caption: {
        fontSize: 14,
        color: Colors.textTertiary,
        fontFamily: 'Okra-Regular',
        lineHeight: 20
    },
    glassCard: {
        backgroundColor: Colors.glassBg,
        borderRadius: BorderRadius.medium,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginVertical: Spacing.sm,
        marginHorizontal: Spacing.md
    },
    gradientButton: {
        borderRadius: BorderRadius.medium,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.medium,
    },
    floatingButton: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.large,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg
    },
    screenPadding: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm
    }
})