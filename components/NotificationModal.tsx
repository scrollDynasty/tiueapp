import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Colors, Shadows } from '../constants/DesignTokens';
import { ThemedText } from './ThemedText';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationDropdownProps {
  isVisible: boolean;
  onClose: () => void;
  notifications?: Notification[];
}

const { width: screenWidth } = Dimensions.get('window');

const getIconByType = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'checkmark-circle-outline';
    case 'warning':
      return 'warning-outline';
    case 'error':
      return 'alert-circle-outline';
    default:
      return 'information-circle-outline';
  }
};

const getColorByType = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return '#059669';
    case 'warning':
      return '#D97706';
    case 'error':
      return '#DC2626';
    default:
      return Colors.brandPrimary;
  }
};

// Треугольная стрелка для dropdown
const Triangle = () => (
  <View
    style={{
      position: 'absolute',
      top: -8,
      right: 20,
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: Colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
    }}
  />
);

export function NotificationModal({ 
  isVisible, 
  onClose, 
  notifications = []
}: NotificationDropdownProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.95, { duration: 150 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { 
        translateY: interpolate(
          scale.value,
          [0.95, 1],
          [-10, 0]
        )
      }
    ]
  }));

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay для закрытия */}
      <Pressable
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onPress={onClose}
      />

      {/* Dropdown container */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 60, // Позиция под кнопкой уведомлений
            right: 16,
            width: Math.min(320, screenWidth - 32),
            maxHeight: 400,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            ...Shadows.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
            zIndex: 1000,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.05)',
          },
          animatedStyle
        ]}
      >
        {/* Треугольная стрелка */}
        <Triangle />

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.06)',
          }}
        >
          <Ionicons 
            name="notifications" 
            size={16} 
            color={Colors.brandPrimary}
            style={{ marginRight: 8 }}
          />
          <ThemedText style={{ 
            fontSize: 15,
            fontWeight: '600',
            color: Colors.textPrimary
          }}>
            Уведомления
          </ThemedText>
        </View>

        {/* Content */}
        {notifications.length === 0 ? (
          // Empty state
          <View
            style={{
              paddingVertical: 32,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.surfaceSubtle,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons 
                name="notifications-off-outline" 
                size={24} 
                color={Colors.textSecondary} 
              />
            </View>
            <ThemedText
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: Colors.textPrimary,
                marginBottom: 4,
              }}
            >
              Нет новых уведомлений
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                textAlign: 'center',
                lineHeight: 16,
              }}
            >
              Мы уведомим вас о важных событиях
            </ThemedText>
          </View>
        ) : (
          // Notifications list
          <ScrollView
            style={{ maxHeight: 300 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {notifications.map((notification, index) => (
              <Pressable
                key={notification.id}
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: index < notifications.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(0,0,0,0.05)',
                  backgroundColor: notification.isRead ? 'transparent' : Colors.brandPrimary + '08',
                }}
                onPress={() => {
                  // Handle notification press
                }}
              >
                {/* Icon */}
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: getColorByType(notification.type) + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  <Ionicons
                    name={getIconByType(notification.type)}
                    size={16}
                    color={getColorByType(notification.type)}
                  />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 4,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 13,
                        fontWeight: notification.isRead ? '500' : '600',
                        color: Colors.textPrimary,
                        flex: 1,
                        lineHeight: 16,
                      }}
                    >
                      {notification.title}
                    </ThemedText>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                      <ThemedText
                        style={{
                          fontSize: 10,
                          color: Colors.textSecondary,
                          marginRight: 4,
                        }}
                      >
                        {notification.time}
                      </ThemedText>
                      {!notification.isRead && (
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: Colors.brandPrimary,
                          }}
                        />
                      )}
                    </View>
                  </View>
                  
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: Colors.textSecondary,
                      lineHeight: 16,
                    }}
                  >
                    {notification.message}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: 'rgba(0,0,0,0.06)',
            }}
          >
            <Pressable
              style={{
                paddingVertical: 6,
                alignItems: 'center',
              }}
              onPress={() => {
                // Mark all as read
              }}
            >
              <ThemedText
                style={{
                  fontSize: 12,
                  color: Colors.brandPrimary,
                  fontWeight: '600',
                }}
              >
                Отметить все как прочитанные
              </ThemedText>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </>
  );
}
