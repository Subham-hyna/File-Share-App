import { Dimensions, Platform } from "react-native";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestPhotoPermission = async () => {
  if (Platform.OS !== 'ios') {
    return
  }
  try {
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    if (result === RESULTS.GRANTED) {
      console.log('STORAGE PERMISSION GRANTED ✅');
    } else {
      console.log('STORAGE PERMISSION DENIED ❌');
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
  }
};

export const isBase64 = (str: string) => {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
  return base64Regex.test(str);
};

export const screenHeight = Dimensions.get('screen').height
export const screenWidth = Dimensions.get('screen').width
export const multiColor = ['#0B3D91', '#1E4DFF', '#104E8B', '#4682B4', '#6A5ACD', '#7B68EE']
export const svgPath = "M0,100L120,120C240,140,480,180,720,180C960,180,1200,140,1320,120L1440,100L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"

export enum Colors {
  primary = '#007AFF',
  secondary = '#5856D6',
  tertiary = '#30D158',
  background = '#F2F2F7',
  surface = '#FFFFFF',
  text = '#1C1C1E',
  textSecondary = '#3C3C43',
  textTertiary = '#8E8E93',
  border = '#E5E5EA',
  error = '#FF3B30',
  warning = '#FF9F0A',
  success = '#30D158',
  info = '#007AFF',
  cardBackground = '#FFFFFF',
  shadowColor = '#000000',
  gradient1 = '#007AFF',
  gradient2 = '#5856D6',
  gradient3 = '#30D158',
  gradient4 = '#FF9F0A',
  
  // Glass morphism colors
  glassBg = 'rgba(255, 255, 255, 0.1)',
  glassBorder = 'rgba(255, 255, 255, 0.2)',
  
  // Dark theme support
  darkBackground = '#000000',
  darkSurface = '#1C1C1E',
  darkText = '#FFFFFF',
}

export const Shadows = {
  small: {
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
}

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  round: 50,
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
}