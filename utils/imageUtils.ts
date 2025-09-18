import React from 'react';
import { Image } from 'react-native';
import { getMediaBaseUrl } from '../config/environment';


/**
 * Получает правильный URL для изображения, обрабатывая различные форматы
 * @param imageUrl - URL изображения от сервера
 * @returns Корректный URL для отображения изображения
 */
export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) {
    return null;
  }

  // Если URL уже полный (содержит http/https), проверяем, нужен ли proxy
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Если это ngrok URL и путь содержит /media/, используем image proxy
    if (imageUrl.includes('.ngrok-free.app') && imageUrl.includes('/media/')) {
      return getProxyImageUrl(imageUrl);
    }
    
    return imageUrl;
  }

  // Если URL относительный, используем proxy для безопасности
  return getProxyImageUrl(imageUrl);
};

/**
 * Создает URL для image proxy
 * @param imageUrl - Оригинальный URL изображения 
 * @returns URL через image proxy
 */
const getProxyImageUrl = (imageUrl: string): string => {
  const baseUrl = getMediaBaseUrl();
  
  let category = '';
  let filename = '';
  
  if (imageUrl.includes('/media/')) {
    // Полный URL - извлекаем категорию и имя файла
    const mediaPath = imageUrl.split('/media/')[1];
    const pathParts = mediaPath.split('/');
    category = pathParts[0];
    filename = pathParts[1];
  } else {
    // Относительный URL - определяем категорию и имя файла
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    const pathParts = cleanImageUrl.split('/');
    
    if (pathParts.length >= 2) {
      category = pathParts[0];
      filename = pathParts[1];
    } else {
      // Если категория не указана, пытаемся определить по имени файла
      filename = pathParts[0];
      if (filename.includes('evt_')) {
        category = 'events';
      } else if (filename.includes('news_')) {
        category = 'news';
      } else {
        category = 'events'; // По умолчанию
      }
    }
  }
  
  const proxyUrl = `${baseUrl}/api/image-proxy/${category}/${filename}`;
  
  return proxyUrl;
};

/**
 * Проверяет, является ли URL действительным изображением
 * @param url - URL для проверки
 * @returns Promise<boolean>
 */
export const isValidImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    const contentType = response.headers.get('content-type');
    const isImage = response.ok && contentType && contentType.startsWith('image/');
    
    return !!isImage;
  } catch (error) {
    return false;
  }
};

/**
 * Получает fallback URL для изображения если основное не загружается
 * @param originalUrl - Оригинальный URL
 * @returns Fallback URL или null
 */
export const getFallbackImageUrl = (originalUrl: string): string | null => {
  // Можно добавить логику для proxy или альтернативных URL
  if (originalUrl.includes('/media/')) {
    // Пробуем через image-proxy endpoint
    const filename = originalUrl.split('/').pop();
    const category = originalUrl.includes('/events/') ? 'events' : 'news';
    const baseUrl = getMediaBaseUrl();
    const proxyUrl = `${baseUrl}/api/image-proxy/${category}/${filename}`;
    
    return proxyUrl;
  }
  
  return null;
};

/**
 * Хук для обработки ошибок загрузки изображений
 */
export const useImageErrorHandler = () => {
  const handleImageError = (imageUrl: string, onFallback?: (fallbackUrl: string) => void) => {
    
    const fallbackUrl = getFallbackImageUrl(imageUrl);
    if (fallbackUrl && onFallback) {
      onFallback(fallbackUrl);
    }
  };

  return { handleImageError };
};

/**
 * Компонент обертка для изображений с обработкой ошибок
 */
export interface ImageWithFallbackProps {
  source: { uri: string };
  style?: any;
  onError?: () => void;
  onLoad?: () => void;
}

// Для использования в компонентах React Native
export const createImageWithFallback = (ImageComponent: typeof Image) => {
  return ({ source, onError, ...props }: ImageWithFallbackProps) => {
    const { handleImageError } = useImageErrorHandler();
    
    const handleError = () => {
      handleImageError(source.uri, (fallbackUrl) => {
        // В React Native нужно обновить source через state компонента
        // Это будет реализовано в конкретных компонентах
      });
      
      if (onError) {
        onError();
      }
    };

    return React.createElement(ImageComponent, {
      ...props,
      source,
      onError: handleError,
    });
  };
};
