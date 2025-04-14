/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
import { authenticateWithFirebase } from "../firebase/firebaseClient";
import { browser } from 'wxt/browser';

export default defineBackground(() => {
    // Check if browser supports side panel API
    const hasSidePanelSupport = !!(browser as any).sidePanel && !!(browser as any).sidePanel.open;

    // Open side panel when extension icon is clicked
    browser.action.onClicked.addListener((tab) => {
      if (hasSidePanelSupport) {
        // Use side panel if supported
        // Open synchronously to preserve user gesture context
        try {
          const windowId = tab.windowId;
          if (windowId) {
            (browser as any).sidePanel.open({ windowId });
          }
        } catch (error) {
          console.error("Error opening side panel:", error);
          // Fallback if side panel fails to open
          browser.tabs.create({ url: 'standalone.html' });
        }
      } else {
        // Fallback: open standalone version in a new tab
        browser.tabs.create({ url: 'standalone.html' });
      }
    });
  
    // Log sidepanel support status to help with debugging
    console.log('Side Panel Support: ' + (hasSidePanelSupport ? 'Yes' : 'No'));

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'chrome_update') {
      return;
    }

    if (details.reason === 'install') {
      browser.tabs.create({
        url: "https://conflictologygames.com/capitol/rules"
      });
    }
  });

  const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';
  let creatingOffscreenDocument: Promise<void> | null = null;

  async function hasOffscreenDocument(): Promise<boolean> {
    const matchedClients = await self.clients.matchAll();
    return matchedClients.some(
      (c) => c.url === browser.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
    );
  }

  async function setupOffscreenDocument(): Promise<void> {
    if (await hasOffscreenDocument()) return;

    if (creatingOffscreenDocument) {
      await creatingOffscreenDocument;
    } else {
      creatingOffscreenDocument = browser.offscreen.createDocument({
        url: browser.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
        reasons: [browser.offscreen.Reason.DOM_SCRAPING],
        justification: 'Firebase Authentication'
      });
      await creatingOffscreenDocument;
      creatingOffscreenDocument = null;
    }
  }

  async function getAuthFromOffscreen(): Promise<any> {
    await setupOffscreenDocument();
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage({ action: 'getAuth', target: 'offscreen' }, (response) => {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
  }

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "signIn") {
      getAuthFromOffscreen()
        .then(async (user: User) => {
          if (!user || !user.uid) {
            console.error("Failed to get valid user from auth flow");
            sendResponse({ error: "Authentication failed" });
            return;
          }
          
          console.log("Authentication successful for:", user.email || user.uid);

          const minimalUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          };

          console.log("Minimal user object:", minimalUser);

          if (user.uid) {
            const res = await authenticateWithFirebase(user.uid)
            console.log("Firebase authentication response:", res);
          }

          
          // Store user data
          await browser.storage.local.set({ user: minimalUser });
          
          // Notify about authentication
          browser.runtime.sendMessage({ 
            type: 'AUTH_STATE_CHANGED',
            user: minimalUser
          });
          
          sendResponse({ user: minimalUser });
        })
        .catch(error => {
          console.error("Authentication error:", error);
          sendResponse({ error: error.message });
        });
      return true; // Keeps the message channel open for async response
    }
    
    if (message.action === "signOut") {
      // Handle sign out
      (async () => {
        try {
          console.log("Processing sign out request");
          
          // Clear user data from browser storage
          await browser.storage.local.remove('user');
          
          // Notify all listening components about auth state change
          browser.runtime.sendMessage({ 
            type: 'AUTH_STATE_CHANGED',
            user: null
          });
          
          console.log("Sign out complete");
          sendResponse({ success: true });
        } catch (error) {
          console.error("Error during sign out:", error);
          sendResponse({ error: String(error) });
        }
      })();
      return true; // Keeps the message channel open for async response
    }
    
    return false;
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      tab.url?.startsWith("https://accounts.google.com/o/oauth2/auth/") ||
      tab.url?.startsWith("https://conflictology-conflict.firebaseapp.com")
    ) {
      if (tab.windowId) {
        browser.windows.update(tab.windowId, { focused: true });
      }
      return;
    }
  });
});