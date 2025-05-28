// Provider Shield - Prevents Web3 provider conflicts
(function() {
  const shield = {
    _ethereumSet: false,
    _web3Set: false,
    
    // Create a safe descriptor that allows only one set operation
    createSafeDescriptor: function(propertyName) {
      return {
        configurable: true,
        enumerable: true,
        get: function() {
          return undefined;
        },
        set: function(value) {
          const key = '_' + propertyName + 'Set';
          if (!this[key]) {
            this[key] = true;
            return true;
          }
          console.warn(`Blocked attempt to inject ${propertyName}`);
          return false;
        }
      };
    },

    // Initialize protection
    init: function() {
      // Protect ethereum
      Object.defineProperty(window, 'ethereum', this.createSafeDescriptor('ethereum'));
      
      // Protect web3
      Object.defineProperty(window, 'web3', this.createSafeDescriptor('web3'));
      
      // Monitor for dynamic property definitions
      const observer = new MutationObserver(() => {
        if (window.ethereum) {
          Object.defineProperty(window, 'ethereum', {
            configurable: true,
            value: undefined
          });
        }
        if (window.web3) {
          Object.defineProperty(window, 'web3', {
            configurable: true,
            value: undefined
          });
        }
      });
      
      observer.observe(document, {
        childList: true,
        subtree: true
      });
    }
  };

  // Initialize protection before any scripts run
  shield.init();
})(); 