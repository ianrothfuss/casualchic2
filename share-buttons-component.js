// Share Buttons Component for Casual Chic Boutique 2.0

// storefront/src/components/ShareButtons.jsx
import React, { useState } from 'react';

const ShareButtons = ({ url, title, image }) => {
  const [copied, setCopied] = useState(false);
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Prepare share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this product: ${url}`)}`,
  };
  
  // Share on mobile devices using Web Share API if available
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: title,
        url,
      }).catch(console.error);
    } else {
      // Fallback to copying to clipboard
      copyToClipboard();
    }
  };
  
  return (
    <div className="share-buttons flex flex-wrap gap-2">
      {/* Facebook */}
      <a
        href={shareUrls.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button facebook"
        aria-label="Share on Facebook"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
        </svg>
      </a>
      
      {/* Twitter */}
      <a
        href={shareUrls.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button twitter"
        aria-label="Share on Twitter"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
        </svg>
      </a>
      
      {/* Pinterest */}
      <a
        href={shareUrls.pinterest}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button pinterest"
        aria-label="Share on Pinterest"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
        </svg>
      </a>
      
      {/* Email */}
      <a
        href={shareUrls.email}
        className="share-button email"
        aria-label="Share via Email"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </a>
      
      {/* Copy Link or Web Share API */}
      <button
        onClick={handleShare}
        className={`share-button copy-link ${copied ? 'copied' : ''}`}
        aria-label="Copy link to clipboard"
      >
        {copied ? (
          <>
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span className="copied-text">Copied!</span>
          </>
        ) : (
          <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ShareButtons;
