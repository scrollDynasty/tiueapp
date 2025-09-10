import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDateYMD } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, Platform, Pressable, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Animation, Spacing } from '../constants/DesignTokens';
import { ThemedText } from './ThemedText';

const { width } = Dimensions.get('window');

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

export function NewsCard({ 
  title, 
  subtitle, 
  date, 
  image,
  events = [],
  icon = 'notifications-outline', 
  onPress,
  onEventPress,
  style,
  index = 0 
}: NewsCardProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const pressed = useSharedValue(0);

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
      entering={FadeIn.delay(index * 100).springify()}
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
              source={{ uri: image }}
              style={{
                width: '100%',
                height: 220,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            />
            <View style={{
              position: 'absolute',
              top: Spacing.m,
              right: Spacing.m,
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: Spacing.s,
              paddingVertical: 6,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="calendar-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
              <ThemedText style={[{ 
                fontSize: 12, 
                color: '#fff', 
              }, textStyles.title]}>
                {formatDateYMD(date)}
              </ThemedText>
            </View>
          </View>
        )}
        
        <View style={{ padding: Spacing.m }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.s }}>
            <LinearGradient
              colors={isDarkMode 
                ? ['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.2)']
                : ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)']
              }
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: Spacing.m,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
              }}
            >
              <Ionicons 
                name={icon} 
                size={22} 
                color={isDarkMode ? '#A5B4FC' : '#6366F1'} 
              />
            </LinearGradient>
            
            <View style={{ flex: 1 }}>
              <ThemedText
                style={[{
                  fontSize: 15,
                  lineHeight: 20,
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
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  <ThemedText style={[{ 
                    fontSize: 13, 
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
              fontSize: 13,
              lineHeight: 18,
              color: colors.textSecondary,
              marginBottom: events.length > 0 ? Spacing.s : 0,
            }}
            numberOfLines={3}
          >
            {subtitle}
          </ThemedText>

          {events.length > 0 && (
            <View
              style={{
                marginTop: Spacing.s,
                paddingTop: Spacing.m,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s }}>
                <LinearGradient
                  colors={isDarkMode 
                    ? ['rgba(34,197,94,0.2)', 'rgba(16,185,129,0.2)']
                    : ['rgba(34,197,94,0.1)', 'rgba(16,185,129,0.1)']
                  }
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: Spacing.xs,
                  }}
                >
                  <Ionicons name="calendar" size={12} color={isDarkMode ? '#10B981' : '#059669'} />
                </LinearGradient>
                <ThemedText
                  style={[{
                    fontSize: 14,
                    color: colors.text,
                  }, textStyles.eventLocation]}
                >
                  Связанные события ({events.length})
                </ThemedText>
              </View>
              
              <View style={{ gap: Spacing.xs }}>
                {events.slice(0, 2).map((event, eventIndex) => (
                  <Pressable
                    key={`event-${event.id}-${eventIndex}`}
                    onPress={() => onEventPress?.(event)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: Spacing.xs,
                      paddingHorizontal: Spacing.s,
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    }}
                  >
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: isDarkMode ? '#10B981' : '#059669',
                      marginRight: Spacing.s,
                    }} />
                    <ThemedText
                      style={[{
                        flex: 1,
                        fontSize: 13,
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
  title: {
  } as TextStyle,
  subtitle: {
  } as TextStyle,
  eventTitle: {
  } as TextStyle,
  eventLocation: {
  } as TextStyle,
  eventDate: {
  } as TextStyle,
  moreEvents: {
  } as TextStyle,
};