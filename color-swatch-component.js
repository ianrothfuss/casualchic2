// Color Swatch Component for Casual Chic Boutique 2.0

// storefront/src/components/ColorSwatch.jsx
import React from 'react';

const ColorSwatch = ({ color, isSelected, onClick, size = 'medium' }) => {
  // Map common color names to hex values
  const colorMap = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#DD0000',
    'green': '#008800',
    'blue': '#0000DD',
    'yellow': '#FFDD00',
    'purple': '#880088',
    'pink': '#FF66AA',
    'orange': '#FF6600',
    'brown': '#884400',
    'gray': '#888888',
    'beige': '#F5F5DC',
    'navy': '#000080',
    'olive': '#808000',
    'burgundy': '#800020',
    'mustard': '#FFDB58',
    'emerald': '#50C878',
    'lavender': '#E6E6FA',
    'teal': '#008080',
    'mint': '#98FB98',
    'coral': '#FF7F50',
    'turquoise': '#40E0D0',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'khaki': '#C3B091',
    'charcoal': '#36454F',
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
    'tan': '#D2B48C',
    'rust': '#B7410E',
  };
  
  // Get color value
  const getColorValue = (colorName) => {
    // Check if it's a hex color already
    if (colorName.startsWith('#')) {
      return colorName;
    }
    
    // Check in our color map
    if (colorMap[colorName.toLowerCase()]) {
      return colorMap[colorName.toLowerCase()];
    }
    
    // Return a default color if not found
    return '#CCCCCC';
  };
  
  // Determine if the color is light or dark to choose appropriate border/check color
  const isLightColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate the perceived brightness (YIQ formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    return yiq >= 128;
  };
  
  const colorValue = getColorValue(color);
  const isDark = !isLightColor(colorValue);
  
  // Size classes
  const sizeClasses = {
    'small': 'w-6 h-6',
    'medium': 'w-8 h-8',
    'large': 'w-10 h-10'
  };
  
  return (
    <button
      className={`color-swatch ${sizeClasses[size] || sizeClasses.medium} rounded-full relative cursor-pointer border ${
        isDark ? 'border-gray-300' : 'border-gray-400'
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={{ backgroundColor: colorValue }}
      onClick={onClick}
      title={color}
      aria-label={`Select color: ${color}`}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke={isDark ? 'white' : 'black'}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
};

export default ColorSwatch;
