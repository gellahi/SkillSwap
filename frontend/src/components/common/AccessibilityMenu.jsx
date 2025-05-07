import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    reducedMotion: false,
    focusHighlight: false
  });
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Apply settings whenever they change
  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Apply font size
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    
    switch (settings.fontSize) {
      case 'small':
        htmlElement.classList.add('text-sm');
        break;
      case 'medium':
        htmlElement.classList.add('text-base');
        break;
      case 'large':
        htmlElement.classList.add('text-lg');
        break;
      case 'x-large':
        htmlElement.classList.add('text-xl');
        break;
      default:
        htmlElement.classList.add('text-base');
    }
    
    // Apply contrast
    htmlElement.classList.remove('high-contrast', 'inverted');
    
    if (settings.contrast === 'high') {
      htmlElement.classList.add('high-contrast');
    } else if (settings.contrast === 'inverted') {
      htmlElement.classList.add('inverted');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      htmlElement.classList.add('reduce-motion');
    } else {
      htmlElement.classList.remove('reduce-motion');
    }
    
    // Apply focus highlight
    if (settings.focusHighlight) {
      htmlElement.classList.add('focus-highlight');
    } else {
      htmlElement.classList.remove('focus-highlight');
    }
  }, [settings]);
  
  const handleChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const resetSettings = () => {
    setSettings({
      fontSize: 'medium',
      contrast: 'normal',
      reducedMotion: false,
      focusHighlight: false
    });
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        aria-label="Accessibility settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
      
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setIsOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>
            
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Accessibility Settings
                </Dialog.Title>
                
                <div className="mt-4 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <div className="flex space-x-4">
                      {['small', 'medium', 'large', 'x-large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleChange('fontSize', size)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            settings.fontSize === size
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contrast
                    </label>
                    <div className="flex space-x-4">
                      {['normal', 'high', 'inverted'].map((contrast) => (
                        <button
                          key={contrast}
                          onClick={() => handleChange('contrast', contrast)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            settings.contrast === contrast
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {contrast.charAt(0).toUpperCase() + contrast.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="reduced-motion"
                      type="checkbox"
                      checked={settings.reducedMotion}
                      onChange={(e) => handleChange('reducedMotion', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="reduced-motion" className="ml-2 block text-sm text-gray-700">
                      Reduce animations and motion
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="focus-highlight"
                      type="checkbox"
                      checked={settings.focusHighlight}
                      onChange={(e) => handleChange('focusHighlight', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="focus-highlight" className="ml-2 block text-sm text-gray-700">
                      Highlight focused elements
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={resetSettings}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                  >
                    Reset to Default
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AccessibilityMenu;
