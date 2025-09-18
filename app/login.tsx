import { LoadingAnimation } from '@/components/LoadingAnimation';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { clearError, loginUser } from '@/store/slices/authSlice';
import { LoginCredentials } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import React, { useEffect, useState } from 'react';
import {
  Alert,
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

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginScreen() {
  const { theme, setTheme } = useTheme();
  const themeColors = getThemeColors(theme === 'dark');
  const { isSmallScreen, spacing, fontSize } = useResponsive();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const toggleShowPassword = React.useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

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
    const glowTimer = setTimeout(() => {
      themeButtonGlow.value = withTiming(1.2, { duration: 1000 }, () => {
        themeButtonGlow.value = withTiming(1, { duration: 1000 });
      });
    }, 1000);

    return () => {
      clearTimeout(glowTimer);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      setShowErrorMessage(true);
      // Показываем разные сообщения в зависимости от типа ошибки
      const title = error.includes('Сессия истекла') ? 'Сессия истекла' : 'Ошибка входа';
      const message = error.includes('Сессия истекла') 
        ? 'Ваша сессия истекла. Пожалуйста, войдите в систему заново.' 
        : error;
      
      Alert.alert(title, message, [
        { text: 'OK', onPress: () => {
            dispatch(clearError());
            setShowErrorMessage(false);
          } 
        }
      ]);
    } else {
      setShowErrorMessage(false);
    }
  }, [error, dispatch]);

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
    if (!credentials.username || !credentials.password) {
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

  const handleUsernameChange = (username: string) => {
    setCredentials({ ...credentials, username: username.toUpperCase().trim() });
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
            size={isSmallScreen ? 22 : 26} 
            color={theme === 'dark' ? '#FFD700' : '#6366F1'} 
            style={{
              textShadowColor: theme === 'dark' ? '#FFD700' : '#6366F1',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            }}
          />
        </AnimatedTouchableOpacity>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.content, { 
            paddingHorizontal: isSmallScreen ? spacing.md : spacing.lg 
          }]}>
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
              
              {/* Username Input */}
              <View style={[styles.inputContainer, { marginBottom: isSmallScreen ? spacing.md : spacing.lg }]}>
                <Text style={[
                  styles.inputLabel, 
                  { 
                    color: themeColors.text,
                    fontSize: isSmallScreen ? 11 : 12
                  }
                ]}>Имя пользователя</Text>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    height: isSmallScreen ? 44 : 52,
                    paddingHorizontal: isSmallScreen ? spacing.sm : spacing.md
                  },
                  focusedInput === 'username' && {
                    borderColor: Colors.brandPrimary,
                    backgroundColor: themeColors.surface,
                    shadowColor: Colors.tabActiveShadow,
                  }
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={isSmallScreen ? 18 : 20} 
                    color={focusedInput === 'username' ? Colors.brandPrimary : themeColors.textSecondary}
                    style={[styles.inputIcon, { marginRight: isSmallScreen ? spacing.xs : spacing.sm }]}
                  />
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: themeColors.text,
                      fontSize: isSmallScreen ? fontSize.small : 14
                    }]}
                    placeholder="U22312"
                    placeholderTextColor={themeColors.textSecondary}
                    value={credentials.username}
                    onChangeText={handleUsernameChange}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusedInput('username')}
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
              <View style={[styles.inputContainer, { marginBottom: isSmallScreen ? spacing.md : spacing.lg }]}>
                <Text style={[
                  styles.inputLabel, 
                  { 
                    color: themeColors.text,
                    fontSize: isSmallScreen ? 11 : 12
                  }
                ]}>Пароль</Text>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    height: isSmallScreen ? 44 : 52,
                    paddingHorizontal: isSmallScreen ? spacing.sm : spacing.md
                  },
                  focusedInput === 'password' && {
                    borderColor: Colors.brandPrimary,
                    backgroundColor: themeColors.surface,
                    shadowColor: Colors.tabActiveShadow,
                  }
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={isSmallScreen ? 18 : 20} 
                    color={focusedInput === 'password' ? Colors.brandPrimary : themeColors.textSecondary}
                    style={[styles.inputIcon, { marginRight: isSmallScreen ? spacing.xs : spacing.sm }]}
                  />
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      color: themeColors.text,
                      fontSize: isSmallScreen ? fontSize.small : 14,
                      paddingRight: isSmallScreen ? 50 : 60, // Увеличиваем отступ справа для кнопки глазика
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
                    onPress={toggleShowPassword}
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
              <Animated.View style={[
                styles.loginButton, 
                buttonAnimatedStyle,
                { 
                  marginTop: isSmallScreen ? spacing.md : spacing.lg,
                  height: isSmallScreen ? 48 : 56
                }
              ]}>
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
                        <LoadingAnimation color={Colors.surface} size={isSmallScreen ? 16 : 20} />
                        <Text style={[
                          styles.buttonText,
                          { fontSize: isSmallScreen ? fontSize.body : 16 }
                        ]}>Вход...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={[
                          styles.buttonText,
                          { fontSize: isSmallScreen ? fontSize.body : 16 }
                        ]}>Войти</Text>
                        <Ionicons 
                          name="arrow-forward" 
                          size={isSmallScreen ? 18 : 20} 
                          color={Colors.surface} 
                        />
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
    minHeight: '100%',
    ...(Platform.OS === 'android' && {
      paddingVertical: Spacing.m, // Уменьшенные отступы для Android
    }),
  },
  
  // Основная форма адаптированная под тему
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: Platform.OS === 'android' ? Spacing.m : Spacing.l,
    paddingVertical: Platform.OS === 'android' ? Spacing.l : Spacing.xl,
    marginTop: Platform.OS === 'android' ? Spacing.m : Spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    // marginBottom динамически устанавливается в компоненте
  },
  inputLabel: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    // height и padding динамически устанавливаются в компоненте
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputIcon: {
    // marginRight динамически устанавливается в компоненте
  },
  input: {
    flex: 1,
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
    right: 12,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  // Кнопка в стиле LoginScreen reference  
  loginButton: {
    // marginTop и height динамически устанавливаются в компоненте
    borderRadius: 12,
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonTouchable: {
    flex: 1,
    borderRadius: 12,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.15,
    elevation: 4,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.m,
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
    top: Platform.OS === 'ios' ? 50 : 15,
    right: 15,
    zIndex: 100,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
