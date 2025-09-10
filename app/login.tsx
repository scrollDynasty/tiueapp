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
    FadeInDown,
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
  const { theme, setTheme } = useTheme();
  const themeColors = getThemeColors(theme === 'dark');
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Анимационные значения
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const themeButtonScale = useSharedValue(1);
  const themeButtonRotation = useSharedValue(0);
  const themeButtonGlow = useSharedValue(1);

  useEffect(() => {
    // Анимация появления формы
    formTranslateY.value = withSpring(0, { 
      damping: 12, 
      stiffness: 100 
    });
    formOpacity.value = withTiming(1, { duration: 800 });

    // Мерцающий эффект для кнопки темы (привлекает внимание)
    setTimeout(() => {
      themeButtonGlow.value = withTiming(1.2, { duration: 1000 }, () => {
        themeButtonGlow.value = withTiming(1, { duration: 1000 });
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      setShowErrorMessage(true);
      // Также показываем алерт для критических ошибок
      Alert.alert('Ошибка входа', error, [
        { text: 'OK', onPress: () => {
            dispatch(clearError());
            setShowErrorMessage(false);
          } 
        }
      ]);
    } else {
      setShowErrorMessage(false);
    }
  }, [error]);

  // Фиксируем стили автозаполнения при смене темы
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Добавляем CSS стили для автозаполнения
      const style = document.createElement('style');
      style.innerHTML = `
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: ${themeColors.text} !important;
          -webkit-box-shadow: 0 0 0px 1000px ${themeColors.surface} inset !important;
          background-color: ${themeColors.surface} !important;
          color: ${themeColors.text} !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [theme, themeColors]);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    // Очищаем предыдущую ошибку
    dispatch(clearError());
    setShowErrorMessage(false);

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
    // Очищаем ошибку при изменении полей
    if (error) {
      dispatch(clearError());
      setShowErrorMessage(false);
    }
  };

  const handlePasswordChange = (password: string) => {
    setCredentials({ ...credentials, password });
    // Очищаем ошибку при изменении полей
    if (error) {
      dispatch(clearError());
      setShowErrorMessage(false);
    }
  };

  const handleThemeToggle = () => {
    // Анимация нажатия и поворота
    themeButtonScale.value = withSpring(0.8, { damping: 15 }, () => {
      themeButtonScale.value = withSpring(1, { damping: 15 });
    });
    
    // Увеличенный поворот для более эффектного перехода
    themeButtonRotation.value = withSpring(themeButtonRotation.value + 720, {
      damping: 12,
      stiffness: 100
    });

    // Добавляем эффект свечения при переключении
    themeButtonGlow.value = withSpring(1.4, { damping: 10 }, () => {
      themeButtonGlow.value = withSpring(1, { damping: 15 });
    });

    // Переключаем тему
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const themeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: themeButtonScale.value * themeButtonGlow.value },
      { rotate: `${themeButtonRotation.value}deg` }
    ],
  }));

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={theme === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={theme === 'dark' ? '#1E293B' : Colors.surface} 
      />
      
      {/* Современный градиентный фон адаптивный к теме */}
      <LinearGradient
        colors={theme === 'dark' 
          ? ['#1E293B', '#334155', '#475569']
          : ['#f7f9fc', '#eef2f7', Colors.surfaceSubtle]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Кнопка смены темы в правом верхнем углу - прозрачная с контуром */}
        <AnimatedTouchableOpacity
          style={[styles.themeButton, themeButtonAnimatedStyle]}
          onPress={handleThemeToggle}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={theme === 'dark' ? "sunny-outline" : "moon-outline"} 
            size={28} 
            color={theme === 'dark' ? '#FFD700' : '#6366F1'} 
            style={{
              textShadowColor: theme === 'dark' ? '#FFD700' : '#6366F1',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 12,
            }}
          />
        </AnimatedTouchableOpacity>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Главная форма адаптированная под тему */}
            <Animated.View style={[
              styles.formContainer, 
              formAnimatedStyle,
              {
                backgroundColor: theme === 'dark' 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(255,255,255,0.95)',
                borderColor: theme === 'dark' 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(0,0,0,0.08)',
              }
            ]}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>Email</Text>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border 
                  },
                  focusedInput === 'email' && {
                    borderColor: Colors.brandPrimary,
                    backgroundColor: themeColors.surface,
                    shadowColor: Colors.tabActiveShadow,
                  }
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={focusedInput === 'email' ? Colors.brandPrimary : themeColors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: themeColors.text,
                    }]}
                    placeholder="your.email@university.uz"
                    placeholderTextColor={themeColors.textSecondary}
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
                    // Фиксируем автозаполнение
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>Пароль</Text>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border 
                  },
                  focusedInput === 'password' && {
                    borderColor: Colors.brandPrimary,
                    backgroundColor: themeColors.surface,
                    shadowColor: Colors.tabActiveShadow,
                  }
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedInput === 'password' ? Colors.brandPrimary : themeColors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: themeColors.text,
                      paddingRight: 60, // Увеличиваем отступ справа для кнопки глазика
                    }]}
                    placeholder="Введите ваш пароль"
                    placeholderTextColor={themeColors.textSecondary}
                    value={credentials.password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    underlineColorAndroid="transparent"
                    selectTextOnFocus={false}
                    blurOnSubmit={false}
                    // Фиксируем автозаполнение пароля
                    autoComplete="current-password"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={themeColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {showErrorMessage && error && (
                <Animated.View 
                  entering={FadeInDown.duration(300)}
                  style={{
                    backgroundColor: theme === 'dark' ? '#FF4444' : '#FFE6E6',
                    borderWidth: 1,
                    borderColor: '#FF4444',
                    borderRadius: 12,
                    padding: Spacing.m,
                    marginTop: Spacing.m,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons 
                    name="alert-circle-outline" 
                    size={20} 
                    color="#FF4444" 
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{
                    color: theme === 'dark' ? '#FFFFFF' : '#CC0000',
                    fontSize: 14,
                    flex: 1,
                  }}>
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(clearError());
                      setShowErrorMessage(false);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons 
                      name="close-outline" 
                      size={18} 
                      color="#FF4444" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}

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
  
  // Основная форма адаптированная под тему
  formContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl * 1.5,
  },
  welcomeTitle: {
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Инпуты адаптированные под тему
  inputContainer: {
    marginBottom: Spacing.l,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: Spacing.m,
    height: 56,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: Spacing.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
    backgroundColor: 'transparent',
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
  },

  // Кнопка смены темы
  themeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    zIndex: 100,
    padding: 10, // Добавляем padding для области нажатия
  },
});
