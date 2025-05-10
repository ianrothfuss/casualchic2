// Accordion Tab Component for Casual Chic Boutique 2.0

// storefront/src/components/AccordionTab.jsx
import React, { useState, useRef, useEffect } from 'react';

const AccordionTab = ({ title, content, isOpen: initialIsOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [height, setHeight] = useState(initialIsOpen ? 'auto' : '0px');
  const contentRef = useRef(null);
  
  // Update height when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setHeight('0px');
    }
  }, [isOpen]);
  
  // Update height when content changes
  useEffect(() => {
    if (isOpen) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [content, isOpen]);
  
  // Toggle accordion
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle transition end to set height to auto when fully open
  const handleTransitionEnd = () => {
    if (isOpen) {
      setHeight('auto');
    }
  };
  
  return (
    <div className="accordion-tab border-b border-gray-200">
      <button
        className="accordion-header w-full py-4 flex justify-between items-center text-left focus:outline-none"
        onClick={toggleAccordion}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium">{title}</h3>
        <span className={`accordion-icon transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      
      <div
        ref={contentRef}
        className="accordion-content overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="py-4 pb-6">
          {typeof content === 'string' ? (
            <p>{content}</p>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};

export default AccordionTab;
