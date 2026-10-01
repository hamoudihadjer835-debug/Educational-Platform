/**
 * Utility function to scroll to the top of the page with smooth animation
 * Used for scrolling to success/error messages at the top of the page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Utility function to scroll to a specific element with smooth animation
 * @param {React.RefObject} ref - React ref object pointing to the element to scroll to
 * @param {Object} options - Scrolling options
 */
export const scrollToElement = (ref, options = {}) => {
  if (ref && ref.current) {
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  }
};
