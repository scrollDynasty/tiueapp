const { getDefaultConfig } = require('expo/metro-config');

// Получаем дефолтную конфигурацию Expo
const config = getDefaultConfig(__dirname);

// Включаем экспериментальную функцию require.context
config.transformer.unstable_allowRequireContext = true;

// Настройка обфускации для production builds
// Отключаем обфускацию для EAS Build, чтобы избежать ошибок при сборке
// Обфускация будет применяться только при локальной сборке с NODE_ENV=production
const isProduction = process.env.NODE_ENV === 'production';
const isEASBuild = process.env.EAS_BUILD === 'true';

if (isProduction && !isEASBuild) {
  try {
    // Используем обфусцирующий трансформер для production
    config.transformer.babelTransformerPath = require.resolve(
      'react-native-obfuscating-transformer'
    );
    
    // Настройки обфускации (менее агрессивные для стабильности)
    config.transformer.obfuscatorOptions = {
      compact: true, // Удалить пробелы и переносы строк
      controlFlowFlattening: false, // Отключено: может ломать код
      deadCodeInjection: false, // Отключено: может ломать код
      debugProtection: false, // Не блокировать DevTools
      debugProtectionInterval: 0,
      disableConsoleOutput: true, // Удалить console.log в production
      identifierNamesGenerator: 'hexadecimal', // Генерация имен переменных
      log: false,
      numbersToExpressions: false, // Отключено для стабильности
      renameGlobals: false, // Не переименовывать глобальные переменные
      selfDefending: false, // Отключено: может конфликтовать с React Native
      simplify: true,
      splitStrings: false, // Отключено для стабильности
      stringArray: true, // Кодирование строк
      stringArrayEncoding: [], // Базовое кодирование без base64
      stringArrayThreshold: 0.5,
      transformObjectKeys: false, // Отключено: может ломать React Native
      unicodeEscapeSequence: false,
    };
  } catch (error) {
    console.warn('Obfuscator not available, using default transformer:', error.message);
  }
}

module.exports = config;