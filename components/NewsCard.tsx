import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { formatDateYMD } from '@/utils/date';
import { getImageUrl } from '@/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Platform, Pressable, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Animation, Spacing } from '../constants/DesignTokens';
import { ThemedText } from './ThemedText';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

interface NewsCardProps {
  title: string;
  subtitle: string;
  date: string;
  image?: string;
  events?: Event[];
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onEventPress?: (event: Event) => void;
  style?: ViewStyle;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NewsCardComponent = ({
  title,
  subtitle,
  date,
  image,
  events = [],
  icon = 'newspaper-outline',
  index = 0,
  onPress,
  onEventPress,
  style,
}: NewsCardProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const pressed = useSharedValue(0);
  const { fontSize, spacing, isSmallScreen, isVerySmallScreen } = useResponsive();

  const imageHeight = isVerySmallScreen ? 160 : isSmallScreen ? 180 : 220;
  const cardPadding = isVerySmallScreen ? spacing.sm : spacing.md;
  const iconSize = isVerySmallScreen ? 32 : 44;
  const iconInnerSize = isVerySmallScreen ? 16 : 22;

  const handlePressIn = () => {
    'worklet';
    pressed.value = withTiming(1, { duration: Animation.duration.short });
  };

  const handlePressOut = () => {
    'worklet';
    pressed.value = withTiming(0, { duration: Animation.duration.short });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.9]);

    return {
      transform: [{ scale }],
      opacity,
    };
  }, []);

  return (
    <AnimatedPressable
      entering={FadeIn.delay((index ?? 0) * 100).springify()}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          ...Platform.select({
            ios: {
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDarkMode ? 0.4 : 0.15,
              shadowRadius: 16,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={isDarkMode 
          ? ['rgba(30,41,59,0.95)', 'rgba(51,65,85,0.90)', 'rgba(71,85,105,0.85)']
          : ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.90)', 'rgba(241,245,249,0.85)']
        }
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {image && (
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: getImageUrl(image) || image }}
              style={{
                width: '100%',
                height: imageHeight,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
              resizeMode="cover"
              onError={() => console.log(`❌ [NewsCard] Failed to load image: ${image}`)}
              onLoad={() => console.log(`✅ [NewsCard] Successfully loaded image: ${image}`)}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
              }}
            />
            <View style={{
              position: 'absolute',
              top: cardPadding,
              right: cardPadding,
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: spacing.xs,
              paddingVertical: 6,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="calendar-outline" size={12} color="#fff" style={{ marginRight: 4 }} />
              <ThemedText style={[{ 
                fontSize: fontSize.small, 
                color: '#fff', 
              }, textStyles.title]}>
                {formatDateYMD(date)}
              </ThemedText>
            </View>
          </View>
        )}
        
        <View style={{ padding: cardPadding }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs }}>
            <LinearGradient
              colors={isDarkMode 
                ? ['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.2)']
                : ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)']
              }
              style={{
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize / 2,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.sm,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
              }}
            >
              <Ionicons 
                name={icon} 
                size={iconInnerSize} 
                color={isDarkMode ? '#A5B4FC' : '#6366F1'} 
              />
            </LinearGradient>
            
            <View style={{ flex: 1 }}>
              <ThemedText
                style={[{
                  fontSize: isVerySmallScreen ? fontSize.small : fontSize.body,
                  lineHeight: isVerySmallScreen ? 18 : 20,
                  color: colors.text,
                  marginBottom: 3,
                }, textStyles.subtitle]}
                numberOfLines={2}
              >
                {title}
              </ThemedText>
              
              {!image && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4
                }}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  <ThemedText style={[{ 
                    fontSize: fontSize.small, 
                    color: colors.textSecondary, 
                  }, textStyles.eventTitle]}>
                    {formatDateYMD(date)}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <ThemedText
            style={{
              fontSize: fontSize.small,
              lineHeight: isVerySmallScreen ? 16 : 18,
              color: colors.textSecondary,
              marginBottom: events.length > 0 ? spacing.xs : 0,
            }}
            numberOfLines={3}
          >
            {subtitle}
          </ThemedText>

          {events && events.length > 0 && (
            <View
              style={{
                marginTop: spacing.xs,
                paddingTop: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                <LinearGradient
                  colors={isDarkMode 
                    ? ['rgba(34,197,94,0.2)', 'rgba(16,185,129,0.2)']
                    : ['rgba(34,197,94,0.1)', 'rgba(16,185,129,0.1)']
                  }
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.xs,
                  }}
                >
                  <Ionicons name="calendar" size={10} color={isDarkMode ? '#10B981' : '#059669'} />
                </LinearGradient>
                <ThemedText
                  style={[{
                    fontSize: fontSize.small,
                    color: colors.text,
                  }, textStyles.eventLocation]}
                >
                  Связанные события ({events.length})
                </ThemedText>
              </View>
              
              <View style={{ gap: spacing.xs }}>
                {events.slice(0, 2).map((event, eventIndex) => (
                  <Pressable
                    key={`event-${event.id}-${eventIndex}`}
                    onPress={() => onEventPress?.(event)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: spacing.xs,
                      paddingHorizontal: spacing.xs,
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    }}
                  >
                    <View style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDarkMode ? '#10B981' : '#059669',
                      marginRight: spacing.xs,
                    }} />
                    <ThemedText
                      style={[{
                        flex: 1,
                        fontSize: fontSize.small,
                        color: colors.textSecondary,
                      }, textStyles.eventDate]}
                      numberOfLines={1}
                    >
                      {event.title}
                    </ThemedText>
                  </Pressable>
                ))}
                
                {events.length > 2 && (
                  <ThemedText
                    style={[{
                      fontSize: 12,
                      color: colors.primary,
                      textAlign: 'center',
                      marginTop: Spacing.xs,
                    }, textStyles.moreEvents]}
                  >
                    +{events.length - 2} еще
                  </ThemedText>
                )}
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

// Стили с правильными типами
const textStyles = {
  title: {} as TextStyle,
  subtitle: {} as TextStyle,
  eventTitle: {} as TextStyle,
  eventLocation: {} as TextStyle,
  eventDate: {} as TextStyle,
  moreEvents: {} as TextStyle,
};

export const NewsCard = React.memo(NewsCardComponent);