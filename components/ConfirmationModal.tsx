import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Colors } from '../constants/DesignTokens';
import { ThemedText } from './ThemedText';

interface ConfirmationModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export function ConfirmationModal({
  isVisible,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  isDangerous = false
}: ConfirmationModalProps) {
  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onCancel}
        />
        
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 340,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          {/* Иконка */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isDangerous ? '#FEE2E2' : '#DBEAFE',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons
              name={isDangerous ? 'warning' : 'help-circle'}
              size={32}
              color={isDangerous ? '#DC2626' : '#3B82F6'}
            />
          </View>

          {/* Заголовок */}
          <ThemedText
            style={{
              fontSize: 20,
              color: Colors.textPrimary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {title}
          </ThemedText>

          {/* Сообщение */}
          <ThemedText
            style={{
              fontSize: 16,
              color: Colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 24,
            }}
          >
            {message}
          </ThemedText>

          {/* Кнопки */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Кнопка отмены */}
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: Colors.surfaceSubtle,
                borderWidth: 1,
                borderColor: Colors.strokeSoft,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                {cancelText}
              </ThemedText>
            </Pressable>

            {/* Кнопка подтверждения */}
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: isDangerous ? '#DC2626' : Colors.brandPrimary,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 16,
                  color: Colors.surface,
                  textAlign: 'center',
                }}
              >
                {confirmText}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
