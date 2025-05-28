// Utility to protect against extension interference
export const initializeExtensionShield = () => {
  // Store original methods
  const originalDefineProperty = Object.defineProperty;
  const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  // Create a safe defineProperty wrapper
  Object.defineProperty = function (
    obj: any,
    prop: string,
    descriptor: PropertyDescriptor
  ): any {
    try {
      // Block extensions from modifying window properties
      if (
        obj === window &&
        (prop.startsWith("__") ||
          prop === "ethereum" ||
          prop === "web3" ||
          prop.includes("chrome"))
      ) {
        console.warn(`Blocked attempt to modify window.${prop}`);
        return obj;
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (e) {
      console.warn(`Error in property definition for ${prop}:`, e);
      return obj;
    }
  };

  // Protect against null/undefined property access
  const safeGetDescriptor = (obj: any, prop: string) => {
    try {
      if (!obj) return undefined;
      return originalGetOwnPropertyDescriptor.call(Object, obj, prop);
    } catch (e) {
      console.warn(`Error getting property descriptor for ${prop}:`, e);
      return undefined;
    }
  };
  Object.getOwnPropertyDescriptor = safeGetDescriptor;

  // Protect against extension errors
  window.addEventListener(
    "error",
    (event) => {
      // Check if error is from an extension
      if (
        event.filename?.includes("chrome-extension://") ||
        event.error?.stack?.includes("chrome-extension://")
      ) {
        event.preventDefault();
        event.stopPropagation();
        console.warn("Blocked extension error:", event.error);
      }
    },
    true
  );

  // Protect input elements
  const originalValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;
  if (originalValueSetter) {
    Object.defineProperty(HTMLInputElement.prototype, "value", {
      set(val) {
        try {
          originalValueSetter.call(this, val);
        } catch (e) {
          console.warn("Error setting input value:", e);
        }
      },
      get() {
        try {
          return this.getAttribute("value") || "";
        } catch (e) {
          console.warn("Error getting input value:", e);
          return "";
        }
      },
      configurable: true,
    });
  }

  // Protect number inputs
  const originalNumberSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "valueAsNumber"
  )?.set;
  if (originalNumberSetter) {
    Object.defineProperty(HTMLInputElement.prototype, "valueAsNumber", {
      set(val) {
        try {
          if (this) {
            originalNumberSetter.call(this, val);
          }
        } catch (e) {
          console.warn("Error setting number value:", e);
        }
      },
      get() {
        try {
          const value = this.value;
          return value ? Number(value) : NaN;
        } catch (e) {
          console.warn("Error getting number value:", e);
          return NaN;
        }
      },
      configurable: true,
    });
  }
};
