import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Animation, Colors, Radius, Shadows, Spacing } from '../constants/DesignTokens';
import { ThemedText } from './ThemedText';

interface ActionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionCard({ title, icon, onPress, style }: ActionCardProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const hovered = useSharedValue(0);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.98, Animation.spring);
    pressed.value = withTiming(1, { duration: Animation.duration.short });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, Animation.spring);
    pressed.value = withTiming(0, { duration: Animation.duration.medium });
  };

  const handleHoverIn = () => {
    'worklet';
    hovered.value = withTiming(1, { duration: Animation.duration.short });
  };

  const handleHoverOut = () => {
    'worklet';
    hovered.value = withTiming(0, { duration: Animation.duration.short });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      hovered.value,
      [0, 1],
      [Shadows.card.shadowOpacity, Shadows.cardHover.shadowOpacity]
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      borderColor: pressed.value > 0.5 ? Colors.brandPrimary : Colors.strokeSoft,
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: pressed.value > 0.5 ? Colors.brandPrimary10 : Colors.surface,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const iconScale = interpolate(
      pressed.value,
      [0, 1],
      [1, 1.1]
    );

    return {
      transform: [{ scale: iconScale }],
    };
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      style={[
        {
          width: 156,
          height: 112,
          borderRadius: Radius.card,
          borderWidth: 1,
          ...Shadows.card,
        },
        animatedStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            padding: Spacing.m,
            borderRadius: Radius.card,
            justifyContent: 'space-between',
          },
          backgroundStyle,
        ]}
      >
        <Animated.View style={iconStyle}>
          <Ionicons 
            name={icon} 
            size={28} 
            color={Colors.brandPrimary} 
          />
        </Animated.View>
        
        <ThemedText
          style={{
            fontSize: 13,
            lineHeight: 18,
            fontWeight: '500',
            color: Colors.textSecondary,
          }}
        >
          {title}
        </ThemedText>
      </Animated.View>
    </AnimatedPressable>
  );
}
