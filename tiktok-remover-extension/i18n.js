class I18n {
  constructor() {
    this.messages = {};
    this.currentLanguage = 'en';
    this.supportedLanguages = {
      'en': 'English',
      'es': 'Español',
      'it': 'Italiano',
      'de': 'Deutsch',
      'fr': 'Français',
      'id': 'Bahasa Indonesia',
      'ja': '日本語',
      'ko': '한국어',
      'ms': 'Bahasa Melayu',
      'pt_BR': 'Português (Brasil)',
      'tr': 'Türkçe',
      'ar': 'العربية',
      'nl': 'Nederlands'
    };
    this.readyPromise = new Promise(res => { this._resolveReady = res; });
  }

  async init() {
    // Get saved language or use browser language
    const savedLanguage = localStorage.getItem('tiktokrepostremover_language');
    if (savedLanguage && this.supportedLanguages[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    } else {
      // Try to detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0];
      if (this.supportedLanguages[langCode]) {
        this.currentLanguage = langCode;
      } else if (browserLang === 'pt-BR' && this.supportedLanguages['pt_BR']) {
        this.currentLanguage = 'pt_BR';
      }
    }

    await this.loadMessages();
    this.translatePage();
    this.setupLanguageSelector();
    // Signal that i18n is ready
    if (this._resolveReady) this._resolveReady(true);
  }

  async loadMessages() {
    try {
      const response = await fetch(`_locales/${this.currentLanguage}/messages.json`);
      if (response.ok) {
        this.messages = await response.json();
      } else {
        // Fallback to English if language file not found
        const fallbackResponse = await fetch('_locales/en/messages.json');
        this.messages = await fallbackResponse.json();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Use English as ultimate fallback
      try {
        const fallbackResponse = await fetch('_locales/en/messages.json');
        this.messages = await fallbackResponse.json();
      } catch (fallbackError) {
        console.error('Error loading fallback messages:', fallbackError);
      }
    }
  }

  getMessage(key, substitutions = {}) {
    const message = this.messages[key];
    if (!message) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }

    let text = message.message;
    
    // Replace placeholders like {count}, {current}, {total}
    Object.keys(substitutions).forEach(placeholder => {
      text = text.replace(new RegExp(`{${placeholder}}`, 'g'), substitutions[placeholder]);
    });

    return text;
  }

  translatePage() {
    // Translate all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getMessage(key);
      
      if (element.tagName === 'INPUT' && element.type === 'button') {
        element.value = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Update document title
    document.title = this.getMessage('appTitle');
  }

  async changeLanguage(languageCode) {
    if (!this.supportedLanguages[languageCode]) {
      console.error(`Unsupported language: ${languageCode}`);
      return;
    }

    this.currentLanguage = languageCode;
    localStorage.setItem('tiktokrepostremover_language', languageCode);
    
    await this.loadMessages();
    this.translatePage();
    
    // Update language selector
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
      languageSelector.value = languageCode;
    }
  }

  setupLanguageSelector() {
    // Create language selector if it doesn't exist
    let languageSelector = document.getElementById('languageSelector');
    if (!languageSelector) {
      const selectorContainer = document.getElementById('languageSelectorContainer');
      if (selectorContainer) {
        languageSelector = document.createElement('select');
        languageSelector.id = 'languageSelector';
        languageSelector.className = 'language-selector';
        
        Object.keys(this.supportedLanguages).forEach(langCode => {
          const option = document.createElement('option');
          option.value = langCode;
          option.textContent = this.supportedLanguages[langCode];
          languageSelector.appendChild(option);
        });
        
        selectorContainer.appendChild(languageSelector);
      }
    }

    if (languageSelector) {
      languageSelector.value = this.currentLanguage;
      languageSelector.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }
  }

  // Method to update dynamic content
  updateDynamicText(elementId, key, substitutions = {}) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = this.getMessage(key, substitutions);
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
} 