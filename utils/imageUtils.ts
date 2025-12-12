import React from 'react';
import { Image } from 'react-native';
import { getMediaBaseUrl } from '../config/environment';

export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {

    if (imageUrl.includes('.ngrok-free.app') && imageUrl.includes('/media/')) {
      return getProxyImageUrl(imageUrl);
    }

    return imageUrl;
  }

  return getProxyImageUrl(imageUrl);
};

const getProxyImageUrl = (imageUrl: string): string => {
  const baseUrl = getMediaBaseUrl();

  let category = '';
  let filename = '';

  if (imageUrl.includes('/media/')) {

    const mediaPath = imageUrl.split('/media/')[1];
    const pathParts = mediaPath.split('/');
    category = pathParts[0];
    filename = pathParts[1];
  } else {

    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    const pathParts = cleanImageUrl.split('/');

    if (pathParts.length >= 2) {
      category = pathParts[0];
      filename = pathParts[1];
    } else {

      filename = pathParts[0];
      if (filename.includes('evt_')) {
        category = 'events';
      } else if (filename.includes('news_')) {
        category = 'news';
      } else {
        category = 'events';
      }
    }
  }

  const proxyUrl = `${baseUrl}/api/image-proxy/${category}/${filename}`;

  return proxyUrl;
};

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

export const getFallbackImageUrl = (originalUrl: string): string | null => {

  if (originalUrl.includes('/media/')) {

    const filename = originalUrl.split('/').pop();
    const category = originalUrl.includes('/events/') ? 'events' : 'news';
    const baseUrl = getMediaBaseUrl();
    const proxyUrl = `${baseUrl}/api/image-proxy/${category}/${filename}`;

    return proxyUrl;
  }

  return null;
};

export const useImageErrorHandler = () => {
  const handleImageError = (imageUrl: string, onFallback?: (fallbackUrl: string) => void) => {

    const fallbackUrl = getFallbackImageUrl(imageUrl);
    if (fallbackUrl && onFallback) {
      onFallback(fallbackUrl);
    }
  };

  return { handleImageError };
};

export interface ImageWithFallbackProps {
  source: { uri: string };
  style?: any;
  onError?: () => void;
  onLoad?: () => void;
}

export const createImageWithFallback = (ImageComponent: typeof Image) => {
  return ({ source, onError, ...props }: ImageWithFallbackProps) => {
    const { handleImageError } = useImageErrorHandler();

    const handleError = () => {
      handleImageError(source.uri, (fallbackUrl) => {

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
