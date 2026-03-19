/**
 * SMF Lead Capture - Chat Widget
 * 
 * Embeddable chat widget for lead capture.
 * 
 * Usage:
 * <script src="https://your-server.com/widget.js"></script>
 * <script>
 *   SMFLeadCapture.init({
 *     serverUrl: 'https://your-server.com',
 *     apiKey: 'your-api-key'
 *   });
 * </script>
 */

(function() {
  'use strict';

  const defaults = {
    position: 'bottom-right',
    primaryColor: '#0066CC',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    greeting: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    autoOpen: false,
    openDelay: 30,
    scrollTrigger: 50,
    exitIntent: true
  };

  let config = {};
  let sessionId = null;
  let isOpen = false;
  let hasInteracted = false;

  function init(userConfig) {
    config = Object.assign({}, defaults, userConfig);
    
    sessionId = localStorage.getItem('smfLeadSessionId') || generateSessionId();
    localStorage.setItem('smfLeadSessionId', sessionId);
    
    injectStyles();
    createWidget();
    setupTriggers();
    
    console.log('[SMF Lead Capture] Widget initialized');
  }

  function generateSessionId() {
    return 'smf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function injectStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      .smf-chat-widget {
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .smf-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .smf-chat-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }

      .smf-chat-container {
        position: fixed;
        width: 380px;
        height: 500px;
        background: ${config.backgroundColor};
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: opacity 0.3s, transform 0.3s;
        opacity: 0;
        transform: scale(0.95);
        pointer-events: none;
      }

      .smf-chat-container.open {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }

      .smf-chat-header {
        background: ${config.primaryColor};
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .smf-chat-header-title {
        font-weight: 600;
        font-size: 16px;
      }

      .smf-chat-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        opacity: 0.8;
      }

      .smf-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .smf-chat-message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }

      .smf-chat-message.user {
        align-self: flex-end;
        background: ${config.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .smf-chat-message.bot {
        align-self: flex-start;
        background: #F0F0F0;
        color: ${config.textColor};
        border-bottom-left-radius: 4px;
      }

      .smf-chat-input-container {
        padding: 16px 20px;
        border-top: 1px solid #E0E0E0;
        display: flex;
        gap: 12px;
      }

      .smf-chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #D0D0D0;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
      }

      .smf-chat-input:focus {
        border-color: ${config.primaryColor};
      }

      .smf-chat-send {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: ${config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .smf-chat-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        align-self: flex-start;
      }

      .smf-chat-typing-dot {
        width: 8px;
        height: 8px;
        background: #999;
        border-radius: 50%;
        animation: typing 1.4s infinite;
      }

      .smf-chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .smf-chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }

      .smf-chat-widget.bottom-right {
        bottom: 20px;
        right: 20px;
      }

      @media (max-width: 480px) {
        .smf-chat-container {
          width: 100%;
          height: 100%;
          border-radius: 0;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  function createWidget() {
    const widget = document.createElement('div');
    widget.className = `smf-chat-widget ${config.position}`;
    
    const button = document.createElement('button');
    button.className = 'smf-chat-button';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    `;
    button.onclick = toggleChat;
    
    const container = document.createElement('div');
    container.className = 'smf-chat-container';
    container.innerHTML = `
      <div class="smf-chat-header">
        <span class="smf-chat-header-title">Chat with us</span>
        <button class="smf-chat-close" onclick="SMFLeadCapture.toggleChat()">✕</button>
      </div>
      <div class="smf-chat-messages" id="smf-chat-messages"></div>
      <div class="smf-chat-input-container">
        <input type="text" class="smf-chat-input" id="smf-chat-input" 
               placeholder="${config.placeholder}" 
               onkeypress="if(event.key==='Enter')SMFLeadCapture.sendMessage()">
        <button class="smf-chat-send" onclick="SMFLeadCapture.sendMessage()">></button>
      </div>
    `;
    
    widget.appendChild(button);
    widget.appendChild(container);
    document.body.appendChild(widget);
    
    config.containerElement = container;
    
    setTimeout(() => {
      if (!hasInteracted) {
        addMessage('bot', config.greeting);
      }
    }, 500);
  }

  function setupTriggers() {
    if (config.openDelay > 0) {
      setTimeout(() => {
        if (!hasInteracted && config.autoOpen) openChat();
      }, config.openDelay * 1000);
    }
    
    if (config.scrollTrigger > 0) {
      let triggered = false;
      window.addEventListener('scroll', () => {
        if (triggered || hasInteracted) return;
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= config.scrollTrigger) {
          triggered = true;
          if (config.autoOpen) openChat();
        }
      });
    }
    
    if (config.exitIntent) {
      document.addEventListener('mouseout', (e) => {
        if (e.clientY < 0 && !hasInteracted) openChat();
      });
    }
  }

  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    config.containerElement.classList.add('open');
    setTimeout(() => {
      const input = document.getElementById('smf-chat-input');
      if (input) input.focus();
    }, 300);
  }

  function closeChat() {
    if (!isOpen) return;
    isOpen = false;
    config.containerElement.classList.remove('open');
  }

  function sendMessage() {
    const input = document.getElementById('smf-chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    input.value = '';
    hasInteracted = true;
    
    showTyping();
    sendToBackend(message);
  }

  function addMessage(role, text) {
    const container = document.getElementById('smf-chat-messages');
    const msg = document.createElement('div');
    msg.className = `smf-chat-message ${role}`;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById('smf-chat-messages');
    const typing = document.createElement('div');
    typing.className = 'smf-chat-typing';
    typing.id = 'smf-chat-typing';
    typing.innerHTML = `
      <div class="smf-chat-typing-dot"></div>
      <div class="smf-chat-typing-dot"></div>
      <div class="smf-chat-typing-dot"></div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('smf-chat-typing');
    if (typing) typing.remove();
  }

  function sendToBackend(message) {
    if (!config.serverUrl) {
      hideTyping();
      addMessage('bot', 'Thanks for your message! We will get back to you soon.');
      return;
    }
    
    fetch(`${config.serverUrl}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey || ''
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message
      })
    })
    .then(r => r.json())
    .then(data => {
      hideTyping();
      addMessage('bot', data.response);
    })
    .catch(err => {
      hideTyping();
      addMessage('bot', 'Thanks for reaching out! We will contact you soon.');
      console.error('[SMF Lead Capture] Error:', err);
    });
  }

  window.SMFLeadCapture = {
    init,
    toggleChat,
    openChat,
    closeChat,
    sendMessage
  };

})();