import { LoadingAnimation } from '@/components/LoadingAnimation';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
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
  const { theme } = useTheme();
  const themeColors = getThemeColors(theme === 'dark');
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Анимационные значения
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Анимация появления логотипа
    logoScale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 120,
      mass: 1
    });
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Анимация появления формы
    setTimeout(() => {
      formTranslateY.value = withSpring(0, { 
        damping: 12, 
        stiffness: 100 
      });
      formOpacity.value = withTiming(1, { duration: 1000 });
    }, 200);
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

    // Анимация кнопки
    buttonScale.value = withSpring(0.95, { 
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

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      
      {/* Современный градиентный фон в стиле LoginScreen */}
      <LinearGradient
        colors={['#f7f9fc', '#eef2f7', Colors.surfaceSubtle]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Логотип-иконка в стиле LoginScreen */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <View style={styles.logoWrapper}>
                <LinearGradient
                  colors={[Colors.brandPrimary, '#1D4ED8']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="school-outline" size={40} color={Colors.surface} />
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Главная форма в стиле LoginScreen */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
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
                    color={focusedInput === 'email' ? Colors.brandPrimary : Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, {
                      // Принудительно переопределяем все стили фокуса
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: Colors.textPrimary,
                    }]}
                    placeholder="your.email@university.ru"
                    placeholderTextColor={Colors.textSecondary}
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
                    color={focusedInput === 'password' ? Colors.brandPrimary : Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: Colors.textPrimary,
                      paddingRight: 60, // Увеличиваем отступ справа для кнопки глазика
                    }]}
                    placeholder="Введите ваш пароль"
                    placeholderTextColor={Colors.textSecondary}
                    value={credentials.password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
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
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <Animated.View style={[styles.loginButton, buttonAnimatedStyle]}>
                <TouchableOpacity
                  style={[styles.loginButtonTouchable, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={loading ? [Colors.surfaceSubtle, Colors.textSecondary] : [Colors.brandPrimary, '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <View style={styles.buttonContent}>
                        <LoadingAnimation color={Colors.surface} size={20} />
                        <Text style={styles.buttonText}>Вход...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Войти</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
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
    alignItems: 'center',
  },
  
  // Логотип в стиле LoginScreen reference
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoWrapper: {
    marginBottom: Spacing.m,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },

  // Основная форма в стиле LoginScreen reference
  formContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl * 1.2,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl * 1.5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '400',
    textAlign: 'center',
  },

  // Инпуты - те самые хорошие, что понравились
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
  },
  passwordToggle: {
    position: 'absolute',
    right: Spacing.m,
    top: 0,
    bottom: 0,
    width: 44,
    height: 56, // Высота такая же как у inputWrapper
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  // Кнопка в стиле LoginScreen reference
  loginButton: {
    marginTop: Spacing.l,
    height: 56,
    borderRadius: 16,
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonTouchable: {
    flex: 1,
    borderRadius: 16,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.15,
    elevation: 4,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.l,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },

  // Информационная карточка в стиле LoginScreen reference
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 16,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.m,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.12)',
    maxWidth: 320,
  },
  infoIcon: {
    marginRight: Spacing.s,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
    lineHeight: 20,
    flex: 1,
  },
});
