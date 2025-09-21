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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const LoginScreen = React.memo(() => {
  const { theme, setTheme } = useTheme();
  const themeColors = useMemo(() => getThemeColors(theme === 'dark'), [theme]);
  const { isSmallScreen, spacing, fontSize } = useResponsive();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
  // Refs для cleanup
  const styleElementRef = useRef<HTMLStyleElement | null>(null);
  
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Анимационные значения
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Анимация появления формы
    formTranslateY.value = withSpring(0, { 
      damping: 12, 
      stiffness: 100 
    });
    formOpacity.value = withTiming(1, { duration: 800 });
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
            // НЕ очищаем ошибку автоматически - только при следующей попытке входа
          } 
        }
      ]);
    }
  }, [error]);

  // Фиксируем стили автозаполнения при смене темы
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Удаляем предыдущий стиль если существует
      if (styleElementRef.current) {
        document.head.removeChild(styleElementRef.current);
        styleElementRef.current = null;
      }
      
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
      styleElementRef.current = style;
      
      return () => {
        if (styleElementRef.current) {
          document.head.removeChild(styleElementRef.current);
          styleElementRef.current = null;
        }
      };
    }
  }, [theme, themeColors]);

  // Валидация входных данных
  const validateInput = useCallback((username: string, password: string) => {
    const errors: string[] = [];
    
    if (!username.trim()) {
      errors.push('Имя пользователя обязательно');
    } else if (username.trim().length < 3) {
      errors.push('Имя пользователя должно содержать минимум 3 символа');
    } else if (!/^[A-Za-z0-9]+$/.test(username.trim())) {
      errors.push('Имя пользователя может содержать только буквы и цифры');
    }
    
    if (!password) {
      errors.push('Пароль обязателен');
    } else if (password.length < 4) {
      errors.push('Пароль должен содержать минимум 4 символа');
    }
    
    return errors;
  }, []);

  const handleLogin = useCallback(async () => {
    // Валидация входных данных
    const validationErrors = validateInput(credentials.username, credentials.password);
    if (validationErrors.length > 0) {
      Alert.alert('Ошибка валидации', validationErrors.join('\n'));
      return;
    }

    // Очищаем предыдущую ошибку только при новой попытке входа
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

    try {
      // Применяем toUpperCase только при отправке и очищаем от XSS
      const submitCredentials = {
        username: credentials.username.toUpperCase().trim().replace(/[<>]/g, ''),
        password: credentials.password,
      };

      await dispatch(loginUser(submitCredentials));
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Ошибка', 'Произошла ошибка при входе в систему');
    }
  }, [credentials, dispatch, validateInput]);

  const handleUsernameChange = useCallback((username: string) => {
    // Убираем toUpperCase() из onChangeText - это вызывает дублирование
    setCredentials(prev => {
      if (prev.username === username) return prev;
      return { ...prev, username };
    });
    // НЕ очищаем ошибку автоматически - только при следующей попытке входа
  }, []);

  const handlePasswordChange = useCallback((password: string) => {
    setCredentials(prev => {
      if (prev.password === password) return prev;
      return { ...prev, password };
    });
    // НЕ очищаем ошибку автоматически - только при следующей попытке входа
  }, []);


  const handleUsernameFocus = useCallback(() => setFocusedInput('username'), []);
  const handlePasswordFocus = useCallback(() => setFocusedInput('password'), []);
  const handleInputBlur = useCallback(() => setFocusedInput(null), []);


  // Мемоизированные стили для лучшей производительности
  const gradientColors = useMemo(() => 
    theme === 'dark' 
      ? ['#1E293B', '#334155', '#475569'] as const
      : ['#f7f9fc', '#eef2f7', Colors.surfaceSubtle] as const,
    [theme]
  );

  const formBackgroundStyle = useMemo(() => ({
    backgroundColor: theme === 'dark' 
      ? 'rgba(255,255,255,0.08)' 
      : 'rgba(255,255,255,0.95)',
    borderColor: theme === 'dark' 
      ? 'rgba(255,255,255,0.15)' 
      : 'rgba(0,0,0,0.08)',
  }), [theme]);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }), []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }), []);



  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={theme === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={theme === 'dark' ? '#1E293B' : Colors.surface} 
      />
      
      {/* Современный градиентный фон адаптивный к теме */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        
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
              formBackgroundStyle
            ]}>
              
              {/* Username Input */}
              <UsernameInput
                themeColors={themeColors}
                isSmallScreen={isSmallScreen}
                spacing={spacing}
                fontSize={fontSize}
                credentials={credentials}
                focusedInput={focusedInput}
                loading={loading}
                onUsernameChange={handleUsernameChange}
                onFocus={handleUsernameFocus}
                onBlur={handleInputBlur}
              />

              {/* Password Input */}
              <PasswordInput
                themeColors={themeColors}
                isSmallScreen={isSmallScreen}
                spacing={spacing}
                fontSize={fontSize}
                credentials={credentials}
                focusedInput={focusedInput}
                loading={loading}
                showPassword={showPassword}
                onPasswordChange={handlePasswordChange}
                onFocus={handlePasswordFocus}
                onBlur={handleInputBlur}
                onTogglePassword={toggleShowPassword}
              />

              {/* Error Message */}
              {showErrorMessage && error && (
                <ErrorMessage
                  error={error}
                  theme={theme}
                  onClose={() => setShowErrorMessage(false)}
                />
              )}

              {/* Login Button */}
              <LoginButton
                loading={loading}
                isSmallScreen={isSmallScreen}
                spacing={spacing}
                fontSize={fontSize}
                animatedStyle={buttonAnimatedStyle}
                onPress={handleLogin}
              />

            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
});

// Оптимизированные компоненты
const UsernameInput = React.memo(({ 
  themeColors, 
  isSmallScreen, 
  spacing, 
  fontSize, 
  credentials, 
  focusedInput, 
  loading, 
  onUsernameChange, 
  onFocus, 
  onBlur 
}: {
  themeColors: any;
  isSmallScreen: boolean;
  spacing: any;
  fontSize: any;
  credentials: LoginCredentials;
  focusedInput: string | null;
  loading: boolean;
  onUsernameChange: (username: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}) => (
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
                    onChangeText={onUsernameChange}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    underlineColorAndroid="transparent"
                    selectTextOnFocus={false}
                    blurOnSubmit={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    accessibilityLabel="Поле для ввода имени пользователя"
                    accessibilityHint="Введите ваше имя пользователя"
                    importantForAutofill="yes"
                  />
    </View>
  </View>
));

const PasswordInput = React.memo(({ 
  themeColors, 
  isSmallScreen, 
  spacing, 
  fontSize, 
  credentials, 
  focusedInput, 
  loading, 
  showPassword,
  onPasswordChange, 
  onFocus, 
  onBlur,
  onTogglePassword
}: {
  themeColors: any;
  isSmallScreen: boolean;
  spacing: any;
  fontSize: any;
  credentials: LoginCredentials;
  focusedInput: string | null;
  loading: boolean;
  showPassword: boolean;
  onPasswordChange: (password: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onTogglePassword: () => void;
}) => (
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
          paddingRight: isSmallScreen ? 50 : 60,
        }]}
        placeholder="Введите ваш пароль"
        placeholderTextColor={themeColors.textSecondary}
        value={credentials.password}
        onChangeText={onPasswordChange}
        secureTextEntry={!showPassword}
        editable={!loading}
        onFocus={onFocus}
        onBlur={onBlur}
        underlineColorAndroid="transparent"
        selectTextOnFocus={false}
        blurOnSubmit={false}
        autoComplete="current-password"
        textContentType="password"
        accessibilityLabel="Поле для ввода пароля"
        accessibilityHint="Введите ваш пароль"
        importantForAutofill="yes"
      />
      <TouchableOpacity
        onPress={onTogglePassword}
        style={styles.passwordToggle}
        activeOpacity={0.7}
        accessibilityLabel={showPassword ? "Скрыть пароль" : "Показать пароль"}
        accessibilityRole="button"
        accessibilityHint="Нажмите чтобы показать или скрыть пароль"
      >
        <Ionicons 
          name={showPassword ? "eye-off-outline" : "eye-outline"} 
          size={20} 
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  </View>
));

const ErrorMessage = React.memo(({ error, theme, onClose }: {
  error: string;
  theme: string;
  onClose: () => void;
}) => (
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
      onPress={onClose}
      style={{ marginLeft: 8 }}
      accessibilityLabel="Скрыть сообщение об ошибке"
      accessibilityRole="button"
      accessibilityHint="Нажмите чтобы скрыть это сообщение (ошибка останется до следующей попытки входа)"
    >
      <Ionicons 
        name="close-outline" 
        size={18} 
        color="#FF4444" 
      />
    </TouchableOpacity>
  </Animated.View>
));

const LoginButton = React.memo(({ 
  loading, 
  isSmallScreen, 
  spacing, 
  fontSize, 
  animatedStyle, 
  onPress 
}: {
  loading: boolean;
  isSmallScreen: boolean;
  spacing: any;
  fontSize: any;
  animatedStyle: any;
  onPress: () => void;
}) => (
  <Animated.View style={[
    styles.loginButton, 
    animatedStyle,
    { 
      marginTop: isSmallScreen ? spacing.md : spacing.lg,
      height: isSmallScreen ? 48 : 56
    }
  ]}>
    <TouchableOpacity
      style={[styles.loginButtonTouchable, loading && styles.loginButtonDisabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.9}
      accessibilityLabel={loading ? "Вход в систему..." : "Войти в систему"}
      accessibilityRole="button"
      accessibilityHint="Нажмите чтобы войти в систему"
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
));

export default LoginScreen;

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

});
