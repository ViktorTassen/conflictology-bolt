// Offscreen page for Firebase authentication handling
const HOSTING_URL = "https://conflictology-conflict.firebaseapp.com";

// Create and append the iframe as soon as the offscreen document loads
const iframe = document.createElement('iframe');
iframe.src = HOSTING_URL;
// Not hiding the iframe for testing purposes
document.body.appendChild(iframe);

console.log('Conflictology Extension Offscreen Page loaded');

// Define types for messages
interface AuthMessage {
  action: string;
  target: string;
}

interface IframeMessageEvent extends MessageEvent {
  data: string | {
    user?: any;
    [key: string]: any;
  };
}

// Listen for messages from the extension
browser.runtime.onMessage.addListener((
  message: AuthMessage, 
  sender: Browser.runtime.MessageSender, 
  sendResponse: (response?: any) => void
) => {
  console.log('Received message in offscreen:', message);
  
  if (message.action === 'getAuth' && message.target === 'offscreen') {
    console.log('Processing getAuth request');
    
    // Handler for messages from the iframe
    function handleIframeMessage(event: IframeMessageEvent) {
      console.log('Received iframe message:', event.data);
      
      try {
        // Ignore Firebase internal messages
        if (typeof event.data === 'string' && event.data.startsWith('!_{')) {
          console.log('Ignoring Firebase internal message');
          return;
        }
        
        // Parse the authentication data if it's a string
        const parsedData = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
        
        console.log('Parsed iframe data:', parsedData);
        
        // Clean up the event listener
        window.removeEventListener('message', handleIframeMessage);
        
        // Send the user data back to the extension
        console.log('Sending response:', parsedData.user);
        sendResponse(parsedData.user);
      } catch (e) {
        const error = e as Error;
        console.error('Error handling iframe message:', error, event.data);
        sendResponse({ error: error.message });
      }
    }

    // Set up the event listener for messages from the iframe
    window.addEventListener('message', handleIframeMessage);
    
    // Request authentication from the iframe
    console.log('Sending initAuth message to iframe');
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({initAuth: true}, HOSTING_URL);
      
      // Set timeout to notify if authentication takes too long
      setTimeout(() => {
        console.log('Authentication is taking longer than expected. The iframe may not be responding.');
      }, 5000);
    } else {
      console.error('iframe.contentWindow is not available');
      sendResponse({ error: 'iframe.contentWindow is not available' });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});