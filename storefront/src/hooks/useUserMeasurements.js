import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as api from '../services/api';

export const useUserMeasurements = () => {
  const { user, isAuthenticated } = useAuth();
  const [measurements, setMeasurements] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user measurements on component mount and when user changes
  useEffect(() => {
    const loadMeasurements = async () => {
      // Only try to load measurements if user is authenticated
      if (!isAuthenticated) {
        setMeasurements(null);
        return;
      }

      try {
        setIsLoading(true);
        const userMeasurements = await api.getUserMeasurements();
        setMeasurements(userMeasurements);
        setError(null);
      } catch (err) {
        // Don't set error if measurements just don't exist yet
        if (err?.status !== 404) {
          setError('Failed to load measurements');
          console.error('Error loading measurements:', err);
        }
        setMeasurements(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeasurements();
  }, [user, isAuthenticated]);

  // Update user measurements
  const updateMeasurements = useCallback(async (measurementsData) => {
    try {
      setIsLoading(true);
      const updatedMeasurements = await api.updateUserMeasurements(measurementsData);
      setMeasurements(updatedMeasurements);
      setError(null);
      return updatedMeasurements;
    } catch (err) {
      console.error('Error updating measurements:', err);
      setError('Failed to update measurements');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get size recommendation for a specific product
  const getSizeRecommendation = useCallback(async (productId, measurementsData = null) => {
    try {
      setIsLoading(true);
      
      // If measurements data provided, use that, otherwise use stored measurements
      const data = measurementsData || measurements;
      
      if (!data) {
        throw new Error('No measurements available');
      }
      
      const recommendation = await api.getSizeRecommendation(productId, data);
      setError(null);
      return recommendation;
    } catch (err) {
      console.error('Error getting size recommendation:', err);
      setError('Failed to get size recommendation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [measurements]);

  return {
    measurements,
    isLoading,
    error,
    updateMeasurements,
    getSizeRecommendation
  };
};