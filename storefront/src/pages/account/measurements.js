import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useUserMeasurements } from '../../hooks/useUserMeasurements';

const AccountMeasurements = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { measurements, updateMeasurements, isLoading, error } = useUserMeasurements();
  
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    shoulder_width: '',
    inseam: '',
  });
  
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/measurements');
    }
  }, [authLoading, isAuthenticated, router]);

  // Populate form with existing measurements
  useEffect(() => {
    if (measurements) {
      setFormData({
        height: measurements.height || '',
        weight: measurements.weight || '',
        bust: measurements.bust || '',
        waist: measurements.waist || '',
        hips: measurements.hips || '',
        shoulder_width: measurements.shoulder_width || '',
        inseam: measurements.inseam || '',
      });
    }
  }, [measurements]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    try {
      // Validate measurements (ensure they're numbers)
      const numericData = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            throw new Error(`${key} must be a number`);
          }
          numericData[key] = numValue;
        }
      });

      // Send update to API
      await updateMeasurements(numericData);
      setSuccessMessage('Your measurements have been saved successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating measurements:', err);
      setFormError(err.message || 'Failed to update measurements');
    }
  };

  // If authentication is loading, show loading indicator
  if (authLoading) {
    return (
      <Layout title="My Measurements | Casual Chic Boutique">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout title="My Measurements | Casual Chic Boutique">
      <Head>
        <title>My Measurements | Casual Chic Boutique</title>
      </Head>

      <div className="account-page py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif font-bold">My Measurements</h1>
            <Link href="/account">
              <a className="text-primary hover:underline">Back to Account</a>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Body Measurements</h2>
              {!isEditing && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Measurements
                </button>
              )}
            </div>

            {/* Form errors and success messages */}
            {formError && (
              <div className="error-alert bg-red-50 text-red-500 p-4 mb-6 rounded">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="success-alert bg-green-50 text-green-500 p-4 mb-6 rounded">
                {successMessage}
              </div>
            )}

            {isLoading ? (
              <div className="loading text-center py-8">Loading your measurements...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Height */}
                  <div className="form-group">
                    <label htmlFor="height" className="block mb-2 text-sm font-medium">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="height"
                      name="height"
                      className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      value={formData.height}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 170"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your height in centimeters
                    </p>
                  </div>

                  {/* Weight */}
                  <div className="form-group">
                    <label htmlFor="weight" className="block mb-2 text-sm font-medium">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="weight"
                      name="weight"
                      className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      value={formData.weight}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 65"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your weight in kilograms
                    </p>
                  </div>

                  {/* Bust */}
                  <div className="form-group">
                    <label htmlFor="bust" className="block mb-2 text-sm font-medium">
                      Bust (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="bust"
                      name="bust"
                      className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      value={formData.bust}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 90"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Measure around the fullest part of your chest
                    </p>
                  </div>

                  {/* Waist */}
                  <div className="form-group">
                    <label htmlFor="waist" className="block mb-2 text-sm font-medium">
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="waist"
                      name="waist"
                      className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      value={formData.waist}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 75"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Measure around your natural waistline
                    </p>
                  </div>

                  {/* Hips */}
                  <div className="form-group">
                    <label htmlFor="hips" className="block mb-2 text-sm font-medium">
                      Hips (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="hips"
                      name="hips"
                      className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      value={formData.hips}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 95"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Measure around the fullest part of your hips
                    </p>
                  </div>

                  {/* Shoulder Width */}
                  <div className="form-group">
                    <label htmlFor="shoulder_width" className="block mb-2 text-sm font-medium">
                      Shoulder Width (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="shoulder_width"
                      name="shoulder_width"
                      className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      value={formData.shoulder_width}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 40"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Measure from the edge of one shoulder to the other
                    </p>
                  </div>

                  {/* Inseam */}
                  <div className="form-group">
                    <label htmlFor="inseam" className="block mb-2 text-sm font-medium">
                      Inseam (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="inseam"
                      name="inseam"
                      className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      value={formData.inseam}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 80"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Measure from the crotch to the bottom of the leg
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                {isEditing && (
                  <div className="form-actions mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormError('');
                        setSuccessMessage('');
                        // Reset form to original data
                        if (measurements) {
                          setFormData({
                            height: measurements.height || '',
                            weight: measurements.weight || '',
                            bust: measurements.bust || '',
                            waist: measurements.waist || '',
                            hips: measurements.hips || '',
                            shoulder_width: measurements.shoulder_width || '',
                            inseam: measurements.inseam || '',
                          });
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Measurements'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Measurement Guide */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-medium mb-4">How to Measure</h2>
            <div className="measurement-guide space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="guide-item">
                  <h3 className="text-lg font-medium mb-2">Bust</h3>
                  <p className="text-gray-600">
                    Measure around the fullest part of your bust, keeping the tape measure straight across your back.
                  </p>
                </div>
                <div className="guide-item">
                  <h3 className="text-lg font-medium mb-2">Waist</h3>
                  <p className="text-gray-600">
                    Measure around your natural waistline, which is the narrowest part of your torso.
                  </p>
                </div>
                <div className="guide-item">
                  <h3 className="text-lg font-medium mb-2">Hips</h3>
                  <p className="text-gray-600">
                    Measure around the fullest part of your hips, usually about 8 inches below your waistline.
                  </p>
                </div>
                <div className="guide-item">
                  <h3 className="text-lg font-medium mb-2">Shoulder Width</h3>
                  <p className="text-gray-600">
                    Measure from the edge of one shoulder to the other, across your back.
                  </p>
                </div>
                <div className="guide-item">
                  <h3 className="text-lg font-medium mb-2">Inseam</h3>
                  <p className="text-gray-600">
                    Measure from the crotch seam to the bottom of the leg along the inner seam.
                  </p>
                </div>
              </div>
              <div className="measurement-tips mt-6 p-4 bg-light rounded">
                <h3 className="text-lg font-medium mb-2">Tips for Accurate Measurements</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use a flexible measuring tape</li>
                  <li>Keep the tape snug but not tight against your body</li>
                  <li>Have someone help you for more accurate measurements</li>
                  <li>Wear minimal clothing for the most accurate results</li>
                  <li>Stand naturally with feet together when measuring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountMeasurements;