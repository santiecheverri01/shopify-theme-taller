/**
 * Popup Newsletter - JavaScript para gestionar el popup de suscripción
 */

class PopupNewsletter {
  constructor() {
    this.popup = null;
    this.form = null;
    this.closeBtn = null;
    this.overlay = null;
    this.isSubmitting = false;
    this.hasBeenShown = false;
    
    // Guardar referencia global para re-aplicar configuraciones
    window.popupNewsletterInstance = this;
    
    // Configuración
    this.config = {
      showDelay: 1000, // 3 segundos después de cargar la página
      showOnExit: true, // Mostrar cuando el usuario intenta salir
      cookieName: 'popup_newsletter_shown',
      cookieExpiry: 0, // Solo por sesión (se borra al cerrar navegador)
      submitEndpoint: '/contact#contact_form' // Endpoint para enviar el formulario
    };

    this.init();
  }

  init() {
    // Verificar si el popup está habilitado
    if (typeof window.popupNewsletterSettings !== 'undefined' && 
        window.popupNewsletterSettings.enabled === false) {
      console.log('🚫 Popup newsletter deshabilitado desde configuración');
      return;
    }
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Doble verificación de que el popup esté habilitado
    if (typeof window.popupNewsletterSettings !== 'undefined' && 
        window.popupNewsletterSettings.enabled === false) {
      console.log('🚫 Popup newsletter deshabilitado - cancelando setup');
      return;
    }
    
    this.popup = document.getElementById('popup-newsletter');
    if (!this.popup) return;

    this.form = document.getElementById('popup-newsletter-form');
    this.closeBtn = this.popup.querySelector('.popup-close');
    this.overlay = this.popup;

    // Aplicar configuraciones dinámicas si están disponibles
    this.applyDynamicSettings();

    this.bindEvents();
    this.schedulePopup();
  }

  applyDynamicSettings() {
    console.log('🔍 Verificando configuraciones del popup...');
    
    if (typeof window.popupNewsletterSettings === 'undefined') {
      console.warn('⚠️ window.popupNewsletterSettings no está definido');
      return;
    }
    
    const settings = window.popupNewsletterSettings;
    console.log('✅ Configuraciones del popup encontradas:', settings);
    console.log('🔄 Aplicando configuraciones dinámicas...');
    
    // Limpiar configuraciones anteriores
    this.clearDynamicElements();
    
    // Actualizar configuración del comportamiento
    this.config.showDelay = settings.showDelay || this.config.showDelay;
    this.config.showOnExit = settings.showOnExit !== undefined ? settings.showOnExit : this.config.showOnExit;
    this.config.cookieExpiry = settings.cookieExpiry !== undefined ? settings.cookieExpiry : this.config.cookieExpiry;
    
    // Aplicar estilos generales del popup
    this.applyPopupStyles(settings);
    
    // Configurar layout
    this.applyLayout(settings);
    
    // Configurar logo
    this.applyLogo(settings);
    
    // Configurar imagen
    this.applyImage(settings);
    
    // Configurar textos
    this.applyTexts(settings);
    
    // Configurar botón
    this.applyButton(settings);
    
    // Configurar mensajes de éxito
    this.applySuccessMessage(settings);
    
    console.log('✅ Todas las configuraciones aplicadas exitosamente');
  }

  applyPopupStyles(settings) {
    const popup = document.getElementById('popup-newsletter');
    const popupContainer = this.popup?.querySelector('.popup-container');
    const popupContent = this.popup?.querySelector('.popup-content');
    const popupLayout = document.getElementById('popup-layout');
    
    if (popupContainer && settings.maxWidth) {
      popupContainer.style.maxWidth = settings.maxWidth + 'px';
    }
    
    if (popupContent) {
      if (settings.borderRadius !== undefined) {
        popupContent.style.borderRadius = settings.borderRadius + 'px';
      }
      if (settings.bgColor) {
        popupContent.style.backgroundColor = settings.bgColor;
      }
      if (settings.padding) {
        popupContent.style.padding = settings.padding + 'px';
      }
    }
    
    if (popupLayout) {
      if (settings.gap) {
        popupLayout.style.gap = settings.gap + 'px';
      }
      if (settings.minHeight) {
        popupLayout.style.minHeight = settings.minHeight + 'px';
      }
    }
    
    if (popup && settings.overlayOpacity !== undefined) {
      const overlayOpacity = settings.overlayOpacity / 100;
      popup.style.backgroundColor = `rgba(0, 0, 0, ${overlayOpacity})`;
    }
    
    console.log('🎨 Estilos generales aplicados');
  }

  applyLayout(settings) {
    const layoutContainer = document.getElementById('popup-layout');
    if (!layoutContainer || !settings.layout) return;
    
    // Limpiar clases de layout anteriores
    layoutContainer.classList.remove('layout-image-left', 'layout-image-right', 'layout-image-top', 'layout-image-bottom', 'layout-content-only');
    
    // Aplicar nueva clase de layout
    layoutContainer.classList.add('layout-' + settings.layout.replace('_', '-'));
    
    console.log('📐 Layout aplicado:', settings.layout);
  }

  applyLogo(settings) {
    const logoContainer = document.getElementById('popup-logo-container');
    const logoElement = document.getElementById('popup-logo-img');
    
    if (settings.showLogo && settings.logoUrl && logoContainer && logoElement) {
      logoElement.src = settings.logoUrl;
      if (settings.logoSize) {
        logoElement.style.maxHeight = settings.logoSize + 'px';
      }
      logoContainer.style.display = 'block';
      console.log('🏷️ Logo configurado:', settings.logoUrl);
    }
  }

  applyImage(settings) {
    const imageContainer = document.getElementById('popup-image-container');
    const imageElement = document.getElementById('popup-banner-img');
    
    if (settings.showImage && settings.imageUrl && imageContainer && imageElement) {
      imageElement.src = settings.imageUrl;
      
      if (settings.imageWidth) {
        imageContainer.style.width = settings.imageWidth + 'px';
        imageContainer.style.maxWidth = settings.imageWidth + 'px';
      }
      
      imageContainer.style.display = 'block';
      console.log('🖼️ Imagen configurada:', settings.imageUrl);
    }
  }

  applyTexts(settings) {
    // Título
    const titleElement = document.getElementById('popup-title-text');
    const titleContainer = document.getElementById('popup-title');
    
    if (titleElement) {
      titleElement.textContent = settings.title || '¡Únete a nuestra comunidad!';
    }
    
    if (titleContainer) {
      if (settings.titleSize) {
        titleContainer.style.fontSize = settings.titleSize + 'px';
      }
      if (settings.titleColor) {
        titleContainer.style.color = settings.titleColor;
      }
      if (settings.titleWeight) {
        titleContainer.style.fontWeight = settings.titleWeight;
      }
    }
    
    // Subtítulo
    const subtitleElement = document.getElementById('popup-subtitle');
    if (subtitleElement) {
      subtitleElement.textContent = settings.subtitle || 'Recibe ofertas exclusivas y mantente al día con nuestras novedades';
      
      if (settings.subtitleSize) {
        subtitleElement.style.fontSize = settings.subtitleSize + 'px';
      }
      if (settings.subtitleColor) {
        subtitleElement.style.color = settings.subtitleColor;
      }
    }
    
    console.log('✏️ Textos configurados');
  }

  applyButton(settings) {
    const buttonElement = document.getElementById('popup-btn-text');
    const submitButton = document.getElementById('popup-submit-btn');
    
    if (buttonElement) {
      buttonElement.textContent = settings.buttonText || 'Suscribirme';
    }
    
    if (submitButton) {
      if (settings.buttonBgColor) {
        submitButton.style.backgroundColor = settings.buttonBgColor;
      }
      if (settings.buttonTextColor) {
        submitButton.style.color = settings.buttonTextColor;
      }
      if (settings.buttonRadius !== undefined) {
        submitButton.style.borderRadius = settings.buttonRadius + 'px';
      }
      if (settings.buttonSize) {
        submitButton.style.fontSize = settings.buttonSize + 'px';
      }
    }
    
    console.log('🎯 Botón configurado');
  }

  applySuccessMessage(settings) {
    const successTitle = document.getElementById('popup-success-title');
    const successMessage = document.getElementById('popup-success-message');
    const successIcon = document.querySelector('.popup-success .success-icon circle');
    
    if (successTitle) {
      successTitle.textContent = settings.successTitle || '¡Gracias por suscribirte!';
    }
    
    if (successMessage) {
      successMessage.textContent = settings.successMessage || 'Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada.';
    }
    
    if (successIcon && settings.successColor) {
      successIcon.setAttribute('fill', settings.successColor);
    }
    
    console.log('✅ Mensaje de éxito configurado');
  }

  clearDynamicElements() {
    // Ocultar elementos que pueden estar visibles de configuraciones anteriores
    const logoContainer = document.getElementById('popup-logo-container');
    const imageContainer = document.getElementById('popup-image-container');
    
    if (logoContainer) logoContainer.style.display = 'none';
    if (imageContainer) imageContainer.style.display = 'none';
    
    console.log('🧹 Elementos dinámicos limpiados');
  }

  bindEvents() {
    // Cerrar popup
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.hidePopup();
      });
    }

    // Cerrar al hacer click en el overlay
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hidePopup();
      }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hidePopup();
      }
    });

    // Envío del formulario
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      // Validación en tiempo real
      this.setupValidation();
    }

    // Mostrar en exit intent (solo en desktop)
    if (this.config.showOnExit && window.innerWidth > 768) {
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !this.hasBeenShown && !this.getCookie(this.config.cookieName)) {
          this.showPopup();
        }
      });
    }
  }

  setupValidation() {
    const nameInput = document.getElementById('popup-name');
    const emailInput = document.getElementById('popup-email');
    const birthdayInput = document.getElementById('popup-birthday');
    const consentInput = document.getElementById('popup-consent');

    // Validación del nombre
    if (nameInput) {
      nameInput.addEventListener('blur', () => this.validateName());
      nameInput.addEventListener('input', () => this.clearError('name-error'));
    }

    // Validación del email
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('input', () => this.clearError('email-error'));
    }

    // Formateo automático de la fecha de nacimiento
    if (birthdayInput) {
      birthdayInput.addEventListener('input', (e) => this.formatBirthday(e));
      birthdayInput.addEventListener('blur', () => this.validateBirthday());
    }

    // Validación del consentimiento
    if (consentInput) {
      consentInput.addEventListener('change', () => this.validateConsent());
    }
  }

  schedulePopup() {
    // No mostrar si ya se mostró en esta sesión o si hay cookie
    if (this.hasBeenShown || this.getCookie(this.config.cookieName)) {
      return;
    }

    // Mostrar después del delay configurado
    setTimeout(() => {
      if (!this.hasBeenShown) {
        this.showPopup();
      }
    }, this.config.showDelay);
  }

  showPopup() {
    if (!this.popup || this.hasBeenShown) return;
    
    this.popup.style.display = 'flex';
    // Pequeño delay para la animación
    setTimeout(() => {
      this.popup.classList.add('show');
    }, 10);
    
    this.hasBeenShown = true;
    document.body.style.overflow = 'hidden';
    
    // Focus en el primer input
    const firstInput = this.popup.querySelector('input[type="text"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }
  }

  hidePopup() {
    if (!this.popup) return;
    
    this.popup.classList.remove('show');
    document.body.style.overflow = '';
    
    setTimeout(() => {
      this.popup.style.display = 'none';
    }, 300);

    // Guardar cookie para no mostrar de nuevo
    this.setCookie(this.config.cookieName, 'true', this.config.cookieExpiry);
  }

  isVisible() {
    return this.popup && this.popup.classList.contains('show');
  }

  async handleSubmit() {
    if (this.isSubmitting) return;

    // Validar todos los campos
    const isValid = this.validateForm();
    if (!isValid) return;

    this.isSubmitting = true;
    this.showLoading(true);

    try {
      const formData = this.getFormData();
      
      // Simular envío (aquí puedes integrar con tu sistema de email marketing)
      await this.submitForm(formData);
      
      this.showSuccess();
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      this.showError('Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.');
    } finally {
      this.isSubmitting = false;
      this.showLoading(false);
    }
  }

  validateForm() {
    let isValid = true;

    isValid = this.validateName() && isValid;
    isValid = this.validateEmail() && isValid;
    isValid = this.validateBirthday() && isValid;
    isValid = this.validateConsent() && isValid;

    return isValid;
  }

  validateName() {
    const input = document.getElementById('popup-name');
    const value = input.value.trim();
    
    if (!value) {
      this.showError('name-error', 'El nombre es obligatorio');
      input.classList.add('error');
      return false;
    }
    
    if (value.length < 2) {
      this.showError('name-error', 'El nombre debe tener al menos 2 caracteres');
      input.classList.add('error');
      return false;
    }
    
    input.classList.remove('error');
    this.clearError('name-error');
    return true;
  }

  validateEmail() {
    const input = document.getElementById('popup-email');
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value) {
      this.showError('email-error', 'El correo electrónico es obligatorio');
      input.classList.add('error');
      return false;
    }
    
    if (!emailRegex.test(value)) {
      this.showError('email-error', 'Por favor, ingresa un correo electrónico válido');
      input.classList.add('error');
      return false;
    }
    
    input.classList.remove('error');
    this.clearError('email-error');
    return true;
  }

  validateBirthday() {
    const input = document.getElementById('popup-birthday');
    const value = input.value.trim();
    
    // La fecha de nacimiento es opcional
    if (!value) {
      input.classList.remove('error');
      this.clearError('birthday-error');
      return true;
    }
    
    const birthdayRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/([0-9]{4})$/;
    
    if (!birthdayRegex.test(value)) {
      this.showError('birthday-error', 'Formato inválido. Usa DD/MM/YYYY (ej: 15/03/1990)');
      input.classList.add('error');
      return false;
    }
    
    // Validar que sea una fecha válida
    const [day, month, year] = value.split('/').map(num => parseInt(num));
    const currentYear = new Date().getFullYear();
    
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      this.showError('birthday-error', 'Fecha inválida. Verifica el día y mes');
      input.classList.add('error');
      return false;
    }
    
    if (year < 1900 || year > currentYear) {
      this.showError('birthday-error', `Año inválido. Debe estar entre 1900 y ${currentYear}`);
      input.classList.add('error');
      return false;
    }
    
    // Validar días por mes (considerando años bisiestos)
    const daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) {
      this.showError('birthday-error', 'Fecha inválida para el mes y año seleccionado');
      input.classList.add('error');
      return false;
    }
    
    input.classList.remove('error');
    this.clearError('birthday-error');
    return true;
  }

  validateConsent() {
    const input = document.getElementById('popup-consent');
    
    if (!input.checked) {
      this.showError('consent-error', 'Debes aceptar los términos para continuar');
      return false;
    }
    
    this.clearError('consent-error');
    return true;
  }

  formatBirthday(e) {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    
    if (value.length >= 3 && value.length <= 4) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    } else if (value.length > 4) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
    }
    
    e.target.value = value;
  }

  getFormData() {
    const birthdayInput = document.getElementById('popup-birthday').value.trim();
    
    return {
      name: document.getElementById('popup-name').value.trim(),
      email: document.getElementById('popup-email').value.trim(),
      birthday: birthdayInput, // DD/MM/YYYY formato completo
      consent: document.getElementById('popup-consent').checked,
      timestamp: new Date().toISOString(),
      source: 'popup_newsletter'
    };
  }

  async submitForm(formData) {
    // Integración con Shopify Customer API
    try {
      const response = await fetch('/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          form_type: 'customer',
          utf8: '✓',
          'customer[email]': formData.email,
          'customer[first_name]': formData.name.split(' ')[0],
          'customer[last_name]': formData.name.split(' ').slice(1).join(' ') || '',
          'customer[tags]': 'newsletter_subscriber',
          // Metafield para fecha de nacimiento (requiere que esté creado en Admin)
          'customer[metafields][custom][birthday]': formData.birthday,
          'customer[accepts_marketing]': true
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error('Error al crear cliente');
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback: solo log de datos si falla la creación
      console.log('Datos del formulario (fallback):', formData);
      return { success: true }; // Para no bloquear la UX
    }
  }

  showSuccess() {
    const form = document.querySelector('.popup-form');
    const success = document.getElementById('popup-success');
    
    if (form && success) {
      form.style.display = 'none';
      success.style.display = 'block';
    }
    
    // Cerrar automáticamente después de 3 segundos
    setTimeout(() => {
      this.hidePopup();
    }, 3000);
  }

  showLoading(show) {
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    const submitBtn = document.querySelector('.popup-submit-btn');
    
    if (btnText && btnLoading && submitBtn) {
      if (show) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
      } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
      }
    }
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  // Utilidades para cookies
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}

// Inicializar el popup cuando se carga el script
function initPopup() {
  console.log('🚀 Iniciando Popup Newsletter...');
  
  // Verificar si el popup está habilitado antes de continuar
  if (typeof window.popupNewsletterSettings !== 'undefined' && 
      window.popupNewsletterSettings.enabled === false) {
    console.log('🚫 Popup Newsletter deshabilitado desde configuración del tema');
    return;
  }
  
  const popup = document.getElementById('popup-newsletter');
  if (popup) {
    console.log('📋 Elemento popup-newsletter encontrado');
    console.log('🔧 Configuraciones globales disponibles:', typeof window.popupNewsletterSettings !== 'undefined' ? 'SÍ' : 'NO');
    
    if (typeof window.popupNewsletterSettings !== 'undefined') {
      console.log('⚙️ Configuraciones actuales:', window.popupNewsletterSettings);
      console.log('✅ Popup habilitado:', window.popupNewsletterSettings.enabled !== false);
    }
    
    new PopupNewsletter();
    console.log('✅ Popup Newsletter inicializado correctamente');
  } else {
    console.warn('⚠️ Elemento popup-newsletter no encontrado, reintentando en 1 segundo...');
    // Reintentar después de 1 segundo
    setTimeout(initPopup, 1000);
  }
}

document.addEventListener('DOMContentLoaded', initPopup);

// También inicializar si el DOM ya está listo
if (document.readyState !== 'loading') {
  initPopup();
}

// Función global para debugging - permite re-aplicar configuraciones desde la consola
window.debugPopupSettings = function() {
  console.log('🔧 DEBUG: Información del popup newsletter');
  console.log('📋 Elemento popup existe:', !!document.getElementById('popup-newsletter'));
  console.log('⚙️ Configuraciones globales:', window.popupNewsletterSettings);
  console.log('✅ Popup habilitado:', window.popupNewsletterSettings?.enabled !== false);
  console.log('🔗 Instancia global:', !!window.popupNewsletterInstance);
  
  if (window.popupNewsletterSettings?.enabled === false) {
    console.log('🚫 El popup está deshabilitado desde la configuración del tema');
    return;
  }
  
  if (window.popupNewsletterInstance) {
    console.log('🔄 Re-aplicando configuraciones...');
    window.popupNewsletterInstance.applyDynamicSettings();
  } else {
    console.warn('⚠️ No hay instancia del popup disponible');
  }
};

// Función para mostrar el popup desde la consola (para testing)
window.showPopupForTesting = function() {
  if (window.popupNewsletterSettings?.enabled === false) {
    console.log('🚫 No se puede mostrar el popup - está deshabilitado desde la configuración del tema');
    return;
  }
  
  if (window.popupNewsletterInstance) {
    console.log('🧪 Mostrando popup para testing...');
    window.popupNewsletterInstance.showPopup();
  } else {
    console.warn('⚠️ No hay instancia del popup disponible');
  }
};
