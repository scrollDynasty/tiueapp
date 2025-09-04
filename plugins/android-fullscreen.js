const { withAndroidManifest } = require('@expo/config-plugins');

const withFullscreen = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Найдем главную активность
    const mainActivity = androidManifest.manifest.application[0].activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Добавляем fullscreen флаги
      mainActivity.$['android:theme'] = '@style/Theme.App.SplashScreen';
      
      // Добавляем флаги для скрытия системных элементов
      if (!mainActivity['meta-data']) {
        mainActivity['meta-data'] = [];
      }
      
      mainActivity['meta-data'].push({
        $: {
          'android:name': 'android.app.lib_name',
          'android:value': 'reactnativejni'
        }
      });
    }

    return config;
  });
};

module.exports = withFullscreen;
