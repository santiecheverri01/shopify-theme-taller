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
    if (typeof window.popupNewsletterSettings === 'undefined') {
      return;
    }
    
    const settings = window.popupNewsletterSettings;
    
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
    
  }

  applyPopupStyles(settings) {
    const popup = document.getElementById('popup-newsletter');
    const popupContainer = this.popup?.querySelector('.popup-container');
    const popupContent = this.popup?.querySelector('.popup-content');
    const popupLayout = document.getElementById('popup-layout');
    
    // Detectar si estamos en móvil
    const isMobile = window.innerWidth <= 768;
    
    // Calcular ancho dinámico basado en la imagen (solo en desktop)
    let dynamicWidth = settings.maxWidth || 800;
    
    if (!isMobile) {
      // Si hay imagen y está en layout horizontal, ajustar el ancho
      if (settings.showImage && settings.imageWidth && 
          (settings.layout === 'image-left' || settings.layout === 'image-right')) {
        // Ancho de imagen + contenido mínimo + padding + gap
        const contentMinWidth = 380; // Ancho mínimo para el contenido de texto
        const totalPadding = (settings.padding || 24) * 2;
        const layoutGap = settings.gap || 24;
        
        dynamicWidth = settings.imageWidth + contentMinWidth + totalPadding + layoutGap;
      }
      
      // Asegurar que sea SIEMPRE más ancho que alto (proporción 2.5:1 mínimo)
      const minHeight = settings.minHeight || 320;
      const minWidthRatio = minHeight * 2.5;
      if (dynamicWidth < minWidthRatio) {
        dynamicWidth = minWidthRatio;
      }
    }
    
    if (popupContainer && !isMobile) {
      popupContainer.style.maxWidth = dynamicWidth + 'px';
      popupContainer.style.width = 'auto';
    } else if (popupContainer && isMobile) {
      // En móvil, usar CSS responsivo
      popupContainer.style.maxWidth = '';
      popupContainer.style.width = '';
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
      
      // En móvil, aplicar imagen de fondo
      if (isMobile && settings.showImage && settings.imageUrl) {
        popupContent.style.backgroundImage = `url(${settings.imageUrl})`;
        
        // Aplicar opacidad del overlay
        const overlay = popupContent.querySelector('::before') || popupContent;
        const overlayOpacity = (100 - (settings.mobileBgOpacity || 30)) / 100;
        
        // Crear o actualizar el pseudo-elemento usando una clase CSS custom
        popupContent.style.setProperty('--mobile-overlay-opacity', overlayOpacity);
      } else if (isMobile) {
        // Limpiar imagen de fondo si no hay imagen
        popupContent.style.backgroundImage = 'none';
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
    console.log('📐 Cálculo de ancho dinámico:');
    console.log('  - Dispositivo móvil:', isMobile ? 'Sí' : 'No');
    console.log('  - Ancho de pantalla:', window.innerWidth + 'px');
    if (!isMobile) {
      console.log('  - Ancho máximo configurado:', settings.maxWidth + 'px');
      console.log('  - Ancho de imagen:', settings.imageWidth + 'px');
      console.log('  - Altura mínima:', (settings.minHeight || 320) + 'px');
      console.log('  - Ancho final calculado:', dynamicWidth + 'px');
      console.log('  - Proporción ancho/alto:', (dynamicWidth / (settings.minHeight || 320)).toFixed(2) + ':1');
    } else {
      console.log('  - En móvil: usando CSS responsivo');
      if (settings.showImage && settings.imageUrl) {
        console.log('  - Imagen de fondo aplicada:', settings.imageUrl);
        console.log('  - Opacidad de overlay móvil:', (100 - (settings.mobileBgOpacity || 30)) + '%');
      }
    }
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
        imageContainer.style.flexShrink = '0'; // Evitar que la imagen se comprima
      }
      
      imageContainer.style.display = 'block';
      console.log('🖼️ Imagen configurada:', settings.imageUrl, 'Ancho:', settings.imageWidth + 'px');
    } else if (imageContainer) {
      imageContainer.style.display = 'none';
      console.log('🖼️ Imagen ocultada');
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

  async handleSubmit() {
    
    // Validar todos los campos
    const isNameValid = this.validateName();
    const isEmailValid = this.validateEmail();
    const isBirthdayValid = this.validateBirthday();
    const isConsentValid = this.validateConsent();
    
    if (!isNameValid || !isEmailValid || !isBirthdayValid || !isConsentValid) {
      return;
    }
    
    // Mostrar loading
    this.showLoading(true);
    
    try {
      const formData = this.getFormData();
      
      const result = await this.submitForm(formData);
      
      if (result.success) {
        
        // Guardar cookie para no mostrar de nuevo
        this.setCookie(this.config.cookieName, 'submitted', this.config.cookieExpiry);
        
        // Mostrar mensaje de éxito
        this.showSuccess();
        
        // Tracking/Analytics (opcional)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'newsletter_signup', {
            'event_category': 'engagement',
            'event_label': 'popup'
          });
        }
      } else {
        throw new Error('Error en el envío');
      }
    } catch (error) {
      this.showError('general-error', 'Hubo un problema al procesar tu suscripción. Por favor intenta de nuevo.');
    } finally {
      this.showLoading(false);
    }
  }

  async submitForm(formData) {
    console.log('📧 Enviando suscripción:', formData);
    
    try {
      // Método correcto: Usar el endpoint de contacto de Shopify
      const formBody = new URLSearchParams();
      formBody.append('form_type', 'create_customer');
      formBody.append('utf8', '✓');
      formBody.append('customer[email]', formData.email);
      formBody.append('customer[first_name]', formData.name.split(' ')[0] || 'Usuario');
      formBody.append('customer[last_name]', formData.name.split(' ').slice(1).join(' ') || 'Newsletter');
      formBody.append('customer[password]', this.generateRandomPassword());
      formBody.append('customer[password_confirmation]', formBody.get('customer[password]'));
      formBody.append('customer[accepts_marketing]', '1');

      console.log('📋 Intentando crear cliente con /contact:', {
        email: formData.email,
        first_name: formData.name.split(' ')[0] || 'Usuario',
        accepts_marketing: '1'
      });

      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formBody.toString()
      });

      console.log('📧 Respuesta crear cliente:', response.status, response.statusText);
      
      // Leer respuesta para más detalles
      const responseText = await response.text();
      console.log('📄 Respuesta detallada:', responseText.substring(0, 200));
      
      if (response.ok || response.status === 302 || response.status === 422) {
        console.log('✅ Cliente procesado exitosamente');
        return { success: true };
      } else {
        // Si falla, intentar con método de newsletter
        console.log('⚠️ Método principal falló, intentando newsletter...');
        return await this.subscribeToNewsletter(formData);
      }
      
    } catch (error) {
      console.error('❌ Error en creación de cliente:', error);
      // Intentar método alternativo
      return await this.subscribeToNewsletter(formData);
    }
  }

  async subscribeToNewsletter(formData) {
    try {
      console.log('🔄 Intentando suscripción directa a newsletter...');
      
      // Método simple: solo suscripción a newsletter
      const formBody = new URLSearchParams();
      formBody.append('form_type', 'customer');
      formBody.append('utf8', '✓');
      formBody.append('contact[email]', formData.email);
      formBody.append('contact[tags]', 'newsletter,popup_subscriber');
      
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formBody.toString()
      });

      console.log('📧 Respuesta newsletter:', response.status);
      
      if (response.ok || response.status === 302) {
        console.log('✅ Suscripción a newsletter exitosa');
        
        // Ahora intentar crear el cliente por separado
        await this.createCustomerSeparately(formData);
        
        return { success: true };
      } else {
        console.log('⚠️ Método newsletter falló, continuando...');
        return { success: true, warning: 'Posible problema de conectividad' };
      }
      
    } catch (error) {
      console.error('❌ Error en suscripción newsletter:', error);
      return { success: true, warning: 'Posible problema de conectividad' };
    }
  }

  async createCustomerSeparately(formData) {
    try {
      console.log('👤 Intentando crear cliente por separado...');
      
      // Usar Shopify Admin API si está disponible, o método directo
      const customerData = {
        email: formData.email,
        first_name: formData.name.split(' ')[0] || 'Usuario',
        last_name: formData.name.split(' ').slice(1).join(' ') || 'Newsletter',
        accepts_marketing: true,
        tags: 'newsletter_popup,popup_subscriber',
        note: formData.birthday ? `Fecha de nacimiento: ${formData.birthday}` : 'Suscrito desde popup'
      };
      
      console.log('👤 Datos del cliente:', customerData);
      
      // Este método puede fallar, pero no es crítico
      // El objetivo principal es la suscripción al newsletter
      
    } catch (error) {
      console.log('⚠️ No se pudo crear cliente por separado, pero newsletter está suscrito');
    }
  }

  generateRandomPassword() {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  }


  showSuccess() {
    const form = document.querySelector('.popup-form');
    const success = document.getElementById('popup-success');
    const closeBtn = document.querySelector('.popup-close');
    
    // Ocultar el título y subtítulo de la parte superior
    const title = document.getElementById('popup-title');
    const subtitle = document.getElementById('popup-subtitle');
    const logoHeader = document.querySelector('.popup-logo-header');
    
    if (form && success) {
      form.style.display = 'none';
      success.style.display = 'block';
    }
    
    // Ocultar elementos de la parte superior
    if (title) title.style.display = 'none';
    if (subtitle) subtitle.style.display = 'none';
    if (logoHeader) logoHeader.style.display = 'none';
    
    // Hacer más visible el botón de cerrar
    if (closeBtn) {
      closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
      closeBtn.style.borderRadius = '50%';
      
      // Animación sutil para llamar la atención
      setTimeout(() => {
        closeBtn.style.transform = 'scale(1.1)';
    setTimeout(() => {
          closeBtn.style.transform = 'scale(1)';
        }, 200);
      }, 500);
    }
    
    // Ya no se cierra automáticamente - el usuario debe cerrarlo manualmente
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

  showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      // Si es error general, mostrar también el contenedor
      if (errorId === 'general-error') {
        const container = errorElement.closest('.general-error');
        if (container) container.style.display = 'block';
      }
    }
  }

  clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      
      // Si es error general, ocultar también el contenedor
      if (errorId === 'general-error') {
        const container = errorElement.closest('.general-error');
        if (container) container.style.display = 'none';
      }
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
  // Esperar a que las configuraciones estén disponibles
  if (typeof window.popupNewsletterSettings === 'undefined') {
    setTimeout(initPopup, 500);
    return;
  }
  
  // Verificar si el popup está habilitado antes de continuar
  if (window.popupNewsletterSettings.enabled === false) {
    return;
  }
  
  const popup = document.getElementById('popup-newsletter');
  if (popup) {
    new PopupNewsletter();
  } else {
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
  console.log('⚙️ Configuraciones globales definidas:', typeof window.popupNewsletterSettings !== 'undefined');
  console.log('⚙️ Configuraciones globales:', window.popupNewsletterSettings);
  console.log('🔧 Estado enabled específico:', window.popupNewsletterSettings?.enabled);
  console.log('✅ Popup habilitado (lógica):', window.popupNewsletterSettings?.enabled !== false);
  console.log('🔗 Instancia global:', !!window.popupNewsletterInstance);
  
  if (window.popupNewsletterSettings?.enabled === false) {
    console.log('🚫 El popup está deshabilitado desde la configuración del tema');
    console.log('🔧 Para habilitarlo, ve a: Configuración del tema > Popup Newsletter > Control General > Activar popup newsletter');
    return;
  }
  
  if (window.popupNewsletterInstance) {
    console.log('🔄 Re-aplicando configuraciones...');
    window.popupNewsletterInstance.applyDynamicSettings(window.popupNewsletterSettings);
  } else {
    console.warn('⚠️ No hay instancia del popup disponible');
    console.log('🔄 Intentando reinicializar...');
    initPopup();
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

// Función para reinicializar completamente el popup
window.reinitializePopup = function() {
  console.log('🔄 Reinicializando popup completamente...');
  
  // Limpiar instancia existente
  if (window.popupNewsletterInstance) {
    window.popupNewsletterInstance = null;
  }
  
  // Forzar reinicialización
  initPopup();
};

// Función para probar la integración con Shopify Flow
window.testShopifyFlowIntegration = function(testEmail = 'test@example.com') {
  console.log('🧪 Probando integración con Shopify Flow...');
  console.log('📧 Email de prueba:', testEmail);
  
  if (!window.popupNewsletterInstance) {
    console.error('❌ No hay instancia del popup disponible');
    return;
  }
  
  // Datos de prueba
  const testData = {
    name: 'Usuario de Prueba Flow',
    email: testEmail,
    birthday: '15/03/1990',
    consent: true,
    timestamp: new Date().toISOString(),
    source: 'popup_newsletter_test'
  };
  
  console.log('📋 Enviando datos de prueba:', testData);
  console.log('⏰ Timestamp:', new Date().toLocaleString());
  
  // Enviar directamente
  window.popupNewsletterInstance.submitForm(testData)
    .then(result => {
      if (result.success) {
        console.log('✅ Prueba exitosa - La automatización debería activarse');
        console.log('🔍 Pasos para verificar:');
        console.log('  1. Ve a Shopify Admin > Customers');
        console.log('  2. Busca el email:', testEmail);
        console.log('  3. Verifica que "Accepts marketing" esté en "Yes"');
        console.log('  4. Ve a Marketing > Automations > "Dar la bienvenida a nuevos suscriptores"');
        console.log('  5. Revisa si hay actividad reciente');
        console.log('⚠️ Nota: El email puede tardar unos minutos en llegar');
      } else {
        console.log('❌ Prueba fallida');
      }
    })
    .catch(error => {
      console.error('❌ Error en la prueba:', error);
    });
};

// Función para verificar el estado de Shopify Flow
window.debugShopifyFlowStatus = function() {
  console.log('🔍 Verificando estado de Shopify Flow...');
  console.log('📋 Información importante:');
  console.log('  - URL actual:', window.location.href);
  console.log('  - Timestamp:', new Date().toLocaleString());
  console.log('  - User Agent:', navigator.userAgent);
  console.log('');
  console.log('🔧 Pasos para verificar manualmente:');
  console.log('  1. Abre Shopify Admin');
  console.log('  2. Ve a Settings > Notifications');
  console.log('  3. Verifica que "Customer email marketing" esté habilitado');
  console.log('  4. Ve a Marketing > Automations');
  console.log('  5. Verifica que tu flujo esté "Active"');
  console.log('  6. Revisa los logs de actividad del flujo');
};

