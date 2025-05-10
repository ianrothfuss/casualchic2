// Virtual Try-On Component for Casual Chic Boutique 2.0

// storefront/src/components/VirtualTryOn.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../hooks/useAuth';
import { useVirtualTryOn } from '../hooks/useVirtualTryOn';
import Loader from './Loader';

const VirtualTryOn = ({ product }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { uploadImage, generateTryOn, userImage, tryOnResult, isLoading, error } = useVirtualTryOn();
  
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadedImageId, setUploadedImageId] = useState(null);
  const [generationStarted, setGenerationStarted] = useState(false);
  const [savedImages, setSavedImages] = useState([]);
  
  // Get saved images from local storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('virtual_try_on_images');
      if (saved) {
        try {
          setSavedImages(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing saved images from local storage', e);
        }
      }
    }
  }, []);
  
  // Save try-on result to local storage when available
  useEffect(() => {
    if (tryOnResult && tryOnResult.url) {
      const newSavedImage = {
        id: tryOnResult.id,
        url: tryOnResult.url,
        productId: product.id,
        productTitle: product.title,
        productThumbnail: product.images && product.images.length > 0
          ? product.images[0].url
          : null,
        createdAt: new Date().toISOString()
      };
      
      const updatedSavedImages = [newSavedImage, ...savedImages.slice(0, 9)]; // Keep last 10 images
      setSavedImages(updatedSavedImages);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('virtual_try_on_images', JSON.stringify(updatedSavedImages));
      }
    }
  }, [tryOnResult, product]);
  
  // Handle image drop/selection
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    try {
      // Upload image
      setGenerationStarted(false);
      const result = await uploadImage(file);
      setUploadedImageId(result.id);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, [uploadImage]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });
  
  // Handle try-on generation
  const handleGenerateTryOn = async () => {
    if (!uploadedImageId || !product) return;
    
    try {
      setGenerationStarted(true);
      await generateTryOn(product.id, uploadedImageId);
    } catch (error) {
      console.error('Error generating try-on:', error);
    }
  };
  
  // Handle clear
  const handleClear = () => {
    setPreviewImage(null);
    setUploadedImageId(null);
    setGenerationStarted(false);
  };
  
  // Delete saved image
  const handleDeleteSavedImage = (imageId) => {
    const updatedSavedImages = savedImages.filter(img => img.id !== imageId);
    setSavedImages(updatedSavedImages);
    
    // Update local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('virtual_try_on_images', JSON.stringify(updatedSavedImages));
    }
  };
  
  return (
    <div className="virtual-try-on">
      <div className="try-on-container">
        <div className="product-image">
          <h3>Product</h3>
          {product.images && product.images.length > 0 ? (
            <div className="relative h-80 w-full">
              <Image 
                src={product.images[0].url}
                alt={product.title}
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
            </div>
          ) : (
            <div className="placeholder-image">
              No product image available
            </div>
          )}
        </div>
        
        <div className="user-image-upload">
          <h3>Your Photo</h3>
          {previewImage ? (
            <div className="preview-container">
              <div className="relative h-80 w-full">
                <Image 
                  src={previewImage}
                  alt="Your uploaded"
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
              <div className="preview-actions mt-4 flex justify-between">
                <button 
                  className="btn btn-secondary"
                  onClick={handleClear}
                >
                  Change Photo
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleGenerateTryOn}
                  disabled={!uploadedImageId || generationStarted || isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Try-On'}
                </button>
              </div>
            </div>
          ) : (
            <div 
              {...getRootProps()} 
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop your photo here...</p>
              ) : (
                <div className="dropzone-content">
                  <div className="upload-icon mb-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="mb-2">Drop your photo here, or click to select</p>
                  <p className="text-gray-500 text-sm">
                    For best results, use a full-body photo with neutral background
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="try-on-result">
          <h3>Try-On Result</h3>
          {isLoading ? (
            <div className="loading-container">
              <Loader />
              <p className="mt-4 text-center">Generating your try-on...</p>
              <p className="text-gray-500 text-sm text-center">
                This may take up to 30 seconds
              </p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="text-error">Error: {error}</p>
              <button 
                className="btn btn-secondary mt-4"
                onClick={handleGenerateTryOn}
              >
                Try Again
              </button>
            </div>
          ) : tryOnResult && tryOnResult.url ? (
            <div className="result-container">
              <div className="relative h-80 w-full">
                <Image 
                  src={tryOnResult.url}
                  alt="Virtual try-on result"
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
              <div className="result-actions mt-4 flex justify-between">
                <button 
                  className="btn btn-secondary"
                  onClick={handleClear}
                >
                  Try Another Photo
                </button>
                <a 
                  href={tryOnResult.url}
                  download={`try-on-${product.title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </div>
            </div>
          ) : generationStarted ? (
            <div className="pending-container">
              <p>Waiting for result...</p>
            </div>
          ) : (
            <div className="empty-result">
              <p>Upload your photo and click "Generate Try-On" to see the result</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Previously Generated Try-Ons */}
      {savedImages.length > 0 && (
        <div className="previous-try-ons mt-12">
          <h3 className="text-xl mb-4">Your Previous Try-Ons</h3>
          
          <div className="try-on-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedImages.map(image => (
              <div key={image.id} className="try-on-item">
                <div className="try-on-image relative h-64 w-full">
                  <Image 
                    src={image.url}
                    alt={`Try-on for ${image.productTitle}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                  
                  <div className="try-on-overlay absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-full">
                      <p className="text-white font-medium">{image.productTitle}</p>
                      <p className="text-white/80 text-sm">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                      
                      <div className="flex justify-between mt-2">
                        <a 
                          href={image.url}
                          download
                          className="text-white underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                        <button 
                          className="text-white/80 text-sm"
                          onClick={() => handleDeleteSavedImage(image.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tips and Guidelines */}
      <div className="try-on-guidelines mt-12 p-6 bg-light rounded-lg">
        <h3 className="text-xl mb-4">Tips for Best Results</h3>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>Use a full-body photo with arms slightly away from the body</li>
          <li>Use a photo with neutral background for best results</li>
          <li>Stand in a natural pose facing the camera</li>
          <li>Wear fitted clothing (not the garment you want to try on)</li>
          <li>Ensure good lighting with minimal shadows</li>
          <li>For privacy, your uploaded photos are automatically deleted after processing</li>
        </ul>
      </div>
      
      {/* Login Prompt (if not logged in) */}
      {!user && (
        <div className="login-prompt mt-8 p-6 bg-primary/10 rounded-lg text-center">
          <h3 className="text-xl mb-2">Save Your Try-Ons</h3>
          <p className="mb-4">
            Log in or create an account to save your try-on images and access them anytime.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/login?redirect=' + router.asPath)}
          >
            Log In or Sign Up
          </button>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;
