// Size Recommendation Component for Casual Chic Boutique 2.0

// storefront/src/components/SizeRecommendation.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useUserMeasurements } from '../hooks/useUserMeasurements';
import Loader from './Loader';

const SizeRecommendation = ({
  product,
  onGetRecommendation,
  recommendation,
  show,
  onClose
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { measurements, isLoading: measurementsLoading, updateMeasurements } = useUserMeasurements();
  
  const [formMeasurements, setFormMeasurements] = useState({
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    shoulder_width: '',
    inseam: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useStoredMeasurements, setUseStoredMeasurements] = useState(true);
  const [activeModal, setActiveModal] = useState(show ? 'form' : null);
  const [lastUsedMeasurements, setLastUsedMeasurements] = useState(null);
  
  // Update form values when measurements are loaded or changed
  useEffect(() => {
    if (measurements && useStoredMeasurements) {
      setFormMeasurements({
        height: measurements.height || '',
        weight: measurements.weight || '',
        bust: measurements.bust || '',
        waist: measurements.waist || '',
        hips: measurements.hips || '',
        shoulder_width: measurements.shoulder_width || '',
        inseam: measurements.inseam || ''
      });
    }
  }, [measurements, useStoredMeasurements]);
  
  // Show the modal when 'show' prop changes
  useEffect(() => {
    if (show) {
      setActiveModal('form');
    } else {
      setActiveModal(null);
    }
  }, [show]);
  
  // Move to results modal when recommendation is received
  useEffect(() => {
    if (recommendation && activeModal === 'form') {
      setActiveModal('results');
    }
  }, [recommendation, activeModal]);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormMeasurements(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Toggle between using stored or new measurements
  const handleToggleStoredMeasurements = () => {
    setUseStoredMeasurements(prev => !prev);
    
    if (!useStoredMeasurements && measurements) {
      // Switching back to stored measurements
      setFormMeasurements({
        height: measurements.height || '',
        weight: measurements.weight || '',
        bust: measurements.bust || '',
        waist: measurements.waist || '',
        hips: measurements.hips || '',
        shoulder_width: measurements.shoulder_width || '',
        inseam: measurements.inseam || ''
      });
    } else {
      // Switching to new measurements
      setFormMeasurements({
        height: '',
        weight: '',
        bust: '',
        waist: '',
        hips: '',
        shoulder_width: '',
        inseam: ''
      });
    }
    
    // Clear errors
    setErrors({});
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const productType = product.metadata?.product_type || '';
    
    // Required fields based on product type
    const requiredFields = {
      tops: ['bust', 'shoulder_width'],
      bottoms: ['waist', 'hips', 'inseam'],
      dresses: ['bust', 'waist', 'hips']
    }[productType] || ['height', 'weight'];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!formMeasurements[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Validate numeric values
    Object.entries(formMeasurements).forEach(([field, value]) => {
      if (value && (isNaN(value) || Number(value) <= 0)) {
        newErrors[field] = 'Must be a positive number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert string values to numbers
      const numericMeasurements = {};
      Object.entries(formMeasurements).forEach(([key, value]) => {
        if (value) {
          numericMeasurements[key] = Number(value);
        }
      });
      
      // Save last used measurements for reference
      setLastUsedMeasurements(numericMeasurements);
      
      // Save measurements if user is logged in
      if (user && Object.keys(numericMeasurements).length > 0) {
        await updateMeasurements({
          ...numericMeasurements,
          user_id: user.id
        });
      }
      
      // Get size recommendation
      await onGetRecommendation(numericMeasurements);
      
    } catch (error) {
      console.error('Error getting size recommendation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close the modal
  const handleClose = () => {
    setActiveModal(null);
    if (onClose) {
      onClose();
    }
  };
  
  // Get confidence level text and class
  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) {
      return { text: 'High', class: 'confidence-high' };
    } else if (confidence >= 0.5) {
      return { text: 'Medium', class: 'confidence-medium' };
    } else {
      return { text: 'Low', class: 'confidence-low' };
    }
  };
  
  // If neither modal is active, return null
  if (!activeModal) {
    return null;
  }
  
  return (
    <div className="size-recommendation-modal">
      <div className="modal-backdrop" onClick={handleClose}></div>
      
      <div className="modal-content">
        <button className="modal-close" onClick={handleClose}>×</button>
        
        {activeModal === 'form' && (
          <div className="size-form-modal">
            <h2 className="text-2xl font-serif mb-4">Find Your Perfect Size</h2>
            
            {measurementsLoading ? (
              <div className="text-center py-8">
                <Loader />
                <p className="mt-4">Loading your measurements...</p>
              </div>
            ) : (
              <>
                {user && measurements && (
                  <div className="stored-measurements-toggle mb-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useStoredMeasurements}
                        onChange={handleToggleStoredMeasurements}
                        className="mr-2"
                      />
                      <span>Use my saved measurements</span>
                    </label>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="measurement-fields grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Height */}
                    <div className="form-group">
                      <label htmlFor="height" className="form-label">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        className={`form-control ${errors.height ? 'is-invalid' : ''}`}
                        value={formMeasurements.height}
                        onChange={handleInputChange}
                        placeholder="e.g. 170"
                      />
                      {errors.height && (
                        <span className="form-error">{errors.height}</span>
                      )}
                    </div>
                    
                    {/* Weight */}
                    <div className="form-group">
                      <label htmlFor="weight" className="form-label">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                        value={formMeasurements.weight}
                        onChange={handleInputChange}
                        placeholder="e.g. 65"
                      />
                      {errors.weight && (
                        <span className="form-error">{errors.weight}</span>
                      )}
                    </div>
                    
                    {/* Only show relevant fields based on product type */}
                    {['tops', 'dresses'].includes(product.metadata?.product_type) && (
                      <>
                        {/* Bust */}
                        <div className="form-group">
                          <label htmlFor="bust" className="form-label">
                            Bust (cm) <span className="text-primary">*</span>
                          </label>
                          <input
                            type="number"
                            id="bust"
                            name="bust"
                            className={`form-control ${errors.bust ? 'is-invalid' : ''}`}
                            value={formMeasurements.bust}
                            onChange={handleInputChange}
                            placeholder="e.g. 90"
                            required={['tops', 'dresses'].includes(product.metadata?.product_type)}
                          />
                          {errors.bust && (
                            <span className="form-error">{errors.bust}</span>
                          )}
                        </div>
                        
                        {/* Shoulder Width */}
                        <div className="form-group">
                          <label htmlFor="shoulder_width" className="form-label">
                            Shoulder Width (cm) {product.metadata?.product_type === 'tops' && <span className="text-primary">*</span>}
                          </label>
                          <input
                            type="number"
                            id="shoulder_width"
                            name="shoulder_width"
                            className={`form-control ${errors.shoulder_width ? 'is-invalid' : ''}`}
                            value={formMeasurements.shoulder_width}
                            onChange={handleInputChange}
                            placeholder="e.g. 40"
                            required={product.metadata?.product_type === 'tops'}
                          />
                          {errors.shoulder_width && (
                            <span className="form-error">{errors.shoulder_width}</span>
                          )}
                        </div>
                      </>
                    )}
                    
                    {['bottoms', 'dresses'].includes(product.metadata?.product_type) && (
                      <>
                        {/* Waist */}
                        <div className="form-group">
                          <label htmlFor="waist" className="form-label">
                            Waist (cm) <span className="text-primary">*</span>
                          </label>
                          <input
                            type="number"
                            id="waist"
                            name="waist"
                            className={`form-control ${errors.waist ? 'is-invalid' : ''}`}
                            value={formMeasurements.waist}
                            onChange={handleInputChange}
                            placeholder="e.g. 75"
                            required={['bottoms', 'dresses'].includes(product.metadata?.product_type)}
                          />
                          {errors.waist && (
                            <span className="form-error">{errors.waist}</span>
                          )}
                        </div>
                        
                        {/* Hips */}
                        <div className="form-group">
                          <label htmlFor="hips" className="form-label">
                            Hips (cm) <span className="text-primary">*</span>
                          </label>
                          <input
                            type="number"
                            id="hips"
                            name="hips"
                            className={`form-control ${errors.hips ? 'is-invalid' : ''}`}
                            value={formMeasurements.hips}
                            onChange={handleInputChange}
                            placeholder="e.g. 95"
                            required={['bottoms', 'dresses'].includes(product.metadata?.product_type)}
                          />
                          {errors.hips && (
                            <span className="form-error">{errors.hips}</span>
                          )}
                        </div>
                      </>
                    )}
                    
                    {product.metadata?.product_type === 'bottoms' && (
                      <div className="form-group">
                        <label htmlFor="inseam" className="form-label">
                          Inseam (cm) <span className="text-primary">*</span>
                        </label>
                        <input
                          type="number"
                          id="inseam"
                          name="inseam"
                          className={`form-control ${errors.inseam ? 'is-invalid' : ''}`}
                          value={formMeasurements.inseam}
                          onChange={handleInputChange}
                          placeholder="e.g. 80"
                          required={product.metadata?.product_type === 'bottoms'}
                        />
                        {errors.inseam && (
                          <span className="form-error">{errors.inseam}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-actions mt-6">
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Calculating...' : 'Get Size Recommendation'}
                    </button>
                  </div>
                  
                  <div className="measurement-guide mt-6 text-sm text-gray-500">
                    <h4 className="text-base font-medium mb-2">How to Measure:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Bust: Measure around the fullest part of your chest</li>
                      <li>Waist: Measure around your natural waistline</li>
                      <li>Hips: Measure around the fullest part of your hips</li>
                      <li>
                        Shoulder Width: Measure from the edge of one shoulder to the other
                      </li>
                      <li>
                        Inseam: Measure from the crotch to the bottom of the leg
                      </li>
                    </ul>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
        
        {activeModal === 'results' && recommendation && (
          <div className="size-results-modal">
            <h2 className="text-2xl font-serif mb-4">Your Recommended Size</h2>
            
            <div className="recommendation-result text-center p-6 mb-6 bg-light rounded-lg">
              <div className="recommended-size text-5xl text-primary font-bold mb-4">
                {recommendation.recommended_size}
              </div>
              
              <div className="confidence-level mb-4">
                {recommendation.confidence && (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Confidence:</span>
                    <span className={getConfidenceLevel(recommendation.confidence).class}>
                      {getConfidenceLevel(recommendation.confidence).text}
                    </span>
                  </div>
                )}
              </div>
              
              <p className="recommendation-note">
                Based on your measurements, we recommend size {recommendation.recommended_size} for this {product.title}.
              </p>
            </div>
            
            {recommendation.alternatives && recommendation.alternatives.length > 0 && (
              <div className="alternative-sizes mb-6">
                <h3 className="text-xl mb-3">Alternative Sizes</h3>
                
                <div className="alternatives-grid grid grid-cols-2 gap-4">
                  {recommendation.alternatives.map((alt, index) => (
                    <div key={index} className="alternative-size p-4 border rounded">
                      <div className="size text-xl font-bold mb-1">{alt.size}</div>
                      <div className="confidence">
                        <span className={getConfidenceLevel(alt.confidence).class}>
                          {getConfidenceLevel(alt.confidence).text} Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="size-note bg-primary/10 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Size Note:</h4>
              <p className="text-sm">
                This recommendation is based on the measurements you provided and our size chart.
                For the most accurate fit, please check the specific garment measurements in the
                product details.
              </p>
            </div>
            
            <div className="result-actions flex space-x-3">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => setActiveModal('form')}
              >
                Update Measurements
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleClose}
              >
                Continue Shopping
              </button>
            </div>
            
            {!user && (
              <div className="login-prompt mt-6 text-center">
                <p className="mb-2">
                  Sign in to save your measurements for future size recommendations.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => router.push('/login?redirect=' + router.asPath)}
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SizeRecommendation;
