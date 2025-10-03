const { getDefaultConfig } = require('expo/metro-config');

// Получаем дефолтную конфигурацию Expo
const config = getDefaultConfig(__dirname);

// Включаем экспериментальную функцию require.context
config.transformer.unstable_allowRequireContext = true;

// Настройка обфускации для production builds
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Используем обфусцирующий трансформер для production
  config.transformer.babelTransformerPath = require.resolve(
    'react-native-obfuscating-transformer'
  );
  
  // Настройки обфускации
  config.transformer.obfuscatorOptions = {
    compact: true, // Удалить пробелы и переносы строк
    controlFlowFlattening: true, // Запутывание логики
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true, // Добавление мертвого кода
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false, // Не блокировать DevTools (может мешать при отладке)
    debugProtectionInterval: 0,
    disableConsoleOutput: true, // Удалить console.log в production
    identifierNamesGenerator: 'hexadecimal', // Генерация имен переменных
    log: false,
    numbersToExpressions: true, // Преобразование чисел в выражения
    renameGlobals: false, // Не переименовывать глобальные переменные (может сломать React Native)
    rotateStringArray: true, // Ротация массива строк
    selfDefending: true, // Защита от форматирования/beautify
    shuffleStringArray: true, // Перемешивание строк
    simplify: true,
    splitStrings: true, // Разделение строк
    splitStringsChunkLength: 10,
    stringArray: true, // Кодирование строк
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'], // Кодирование base64
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true, // Преобразование ключей объектов
    unicodeEscapeSequence: false, // Не использовать unicode (может увеличить размер)
  };
}

module.exports = config;