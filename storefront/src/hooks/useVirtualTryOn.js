import { useState, useCallback } from 'react';
import * as api from '../services/api';

export const useVirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload user image
  const uploadImage = useCallback(async (file) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create FormData with file
      const formData = new FormData();
      formData.append('file', file);

      // Upload image
      const response = await api.uploadTryOnImage(formData);
      setUserImage(response);
      return response;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate virtual try-on
  const generateTryOn = useCallback(async (productId, userImageId) => {
    try {
      setIsLoading(true);
      setError(null);
      setTryOnResult(null);

      // Generate try-on
      const response = await api.generateVirtualTryOn(productId, userImageId);
      
      // If generation is asynchronous and returns a job ID
      if (response.status === 'processing' && response.id) {
        // Poll for result
        const result = await pollTryOnResult(response.id);
        setTryOnResult(result);
        return result;
      } else {
        // If generation is synchronous and returns result directly
        setTryOnResult(response);
        return response;
      }
    } catch (err) {
      console.error('Error generating virtual try-on:', err);
      setError('Failed to generate virtual try-on. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll for try-on result (if processing is asynchronous)
  const pollTryOnResult = useCallback(async (tryOnId) => {
    const maxAttempts = 30;
    const interval = 2000; // 2 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Get try-on result
        const result = await api.getTryOnResult(tryOnId);
        
        // If processing is complete, return result
        if (result.status === 'completed') {
          return result;
        }
        
        // If processing failed, throw error
        if (result.status === 'failed') {
          throw new Error(result.error || 'Virtual try-on generation failed');
        }
        
        // Wait before trying again
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (err) {
        if (attempt === maxAttempts - 1) {
          throw err;
        }
      }
    }
    
    throw new Error('Virtual try-on generation timed out');
  }, []);

  return {
    userImage,
    tryOnResult,
    isLoading,
    error,
    uploadImage,
    generateTryOn
  };
};