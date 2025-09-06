import { LoadingAnimation } from '@/components/LoadingAnimation';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearError, loginUser } from '@/store/slices/authSlice';
import { LoginCredentials } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginScreen() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Анимационные значения
  const formScale = useSharedValue(0.8);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Анимация появления формы с более плавными переходами
    formScale.value = withSpring(1, { 
      damping: 12, 
      stiffness: 100,
      mass: 0.8
    });
    formOpacity.value = withTiming(1, { duration: 1200 });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка входа', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    // Более эффектная анимация кнопки
    buttonScale.value = withSpring(0.92, { 
      damping: 10,
      stiffness: 300
    }, () => {
      buttonScale.value = withSpring(1, { 
        damping: 8,
        stiffness: 200
      });
    });

    await dispatch(loginUser(credentials));
  };

  const handleEmailChange = (email: string) => {
    setCredentials({ ...credentials, email: email.toLowerCase().trim() });
  };

  const handlePasswordChange = (password: string) => {
    setCredentials({ ...credentials, password });
  };

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: formScale.value }],
      opacity: formOpacity.value,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Элегантный фон с вашей цветовой палитрой */}
      <LinearGradient
        colors={[Colors.surface, Colors.surfaceSubtle, '#E5EAF2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Элегантные декоративные элементы */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(1500).springify().damping(15)}
        style={[styles.decorativeCircle, styles.circle1]} 
      />
      <Animated.View 
        entering={FadeInUp.delay(400).duration(1500).springify().damping(12)}
        style={[styles.decorativeCircle, styles.circle2]} 
      />
      <Animated.View 
        entering={FadeInUp.delay(600).duration(1500).springify().damping(10)}
        style={[styles.decorativeCircle, styles.circle3]} 
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.content, formAnimatedStyle]}>
            {/* Header */}
            <Animated.View 
              entering={FadeInDown.delay(300).duration(1200).springify().damping(8)}
              style={styles.header}
            >
              <Text style={styles.title}>Добро пожаловать</Text>
              <Text style={styles.subtitle}>Войдите в университетскую систему</Text>
            </Animated.View>

            {/* Login Form */}
            <Animated.View 
              entering={SlideInDown.delay(500).duration(1000).springify().damping(12)}
              style={styles.formCard}
            >
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[
                  styles.inputWrapper, 
                  focusedInput === 'email' && styles.inputWrapperFocused
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={focusedInput === 'email' ? '#2563EB' : '#64748b'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, {
                      // Принудительно переопределяем все стили фокуса
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: '#111827',
                    }]}
                    placeholder="your.email@university.ru"
                    placeholderTextColor="#94a3b8"
                    value={credentials.email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    underlineColorAndroid="transparent"
                    selectTextOnFocus={false}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Пароль</Text>
                <View style={[
                  styles.inputWrapper, 
                  focusedInput === 'password' && styles.inputWrapperFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedInput === 'password' ? '#2563EB' : '#64748b'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, {
                      // Принудительно переопределяем все стили фокуса
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: '#111827',
                    }]}
                    placeholder="Введите пароль"
                    placeholderTextColor="#94a3b8"
                    value={credentials.password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    underlineColorAndroid="transparent"
                    selectTextOnFocus={false}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <AnimatedTouchableOpacity
                style={[styles.loginButton, buttonAnimatedStyle, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#94a3b8', '#64748b'] : ['#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <LoadingAnimation 
                          color="#ffffff" 
                          size={20}
                      />
                      <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>Вход...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Войти</Text>
                      <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </AnimatedTouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <Animated.View 
              entering={FadeInUp.delay(700).duration(1000).springify().damping(15)}
              style={styles.footer}
            >
              <View style={styles.footerCard}>
                <Ionicons name="information-circle-outline" size={16} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.footerText}>
                  Используйте учетные данные, предоставленные администрацией университета
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.l,
    justifyContent: 'center',
    minHeight: height,
  },
  // Декоративные элементы
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.brandPrimary10,
    borderWidth: 1,
    borderColor: Colors.strokeSoft,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    top: height * 0.15,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: height * 0.2,
    right: -50,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl * 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  // Form
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.l,
    shadowColor: Colors.shadowUmbra,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.strokeSoft,
  },
  inputContainer: {
    marginBottom: Spacing.l,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.strokeSoft,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.m,
    height: 56,
    position: 'relative',
  },
  inputWrapperFocused: {
    borderColor: Colors.brandPrimary,
    backgroundColor: Colors.surface,
    shadowColor: Colors.tabActiveShadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: Spacing.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    // Полностью убираем все системные стили
    borderWidth: 0,
    margin: 0,
    padding: 0,
    outlineWidth: 0,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
    ...(Platform.OS === 'web' && {
      outline: 'none',
      boxShadow: 'none',
    }),
  },
  passwordToggle: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  // Button
  loginButton: {
    borderRadius: 12,
    marginTop: Spacing.l,
    height: 56,
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButtonGradient: {
    flex: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.l,
  },
  loginButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: Spacing.l,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 12,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
    flex: 1,
  },
});
