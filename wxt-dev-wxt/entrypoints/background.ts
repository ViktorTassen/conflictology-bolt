/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
import { authenticateWithFirebase } from "../firebase/firebaseClient";
import { browser } from 'wxt/browser';

export default defineBackground(() => {
    // Check if browser supports side panel API
    const hasSidePanelSupport = !!(browser as any).sidePanel && !!(browser as any).sidePanel.open;

    // Open side panel when extension icon is clicked
    browser.action.onClicked.addListener(() => {
      if (hasSidePanelSupport) {
        // Use side panel if supported
        browser.windows.getCurrent({ populate: true }).then((window) => {
          if (window.id) {
            (browser as any).sidePanel.open({ windowId: window.id });
          }
        });
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
          const minimalUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          };
          
          // Authenticate Firebase with the access token
          if (user.uid) {
            await authenticateWithFirebase(user.uid);
          }

          await browser.storage.local.set({ user: minimalUser });
          
          // Notify any open popups about the authentication change
          browser.runtime.sendMessage({ 
            type: 'AUTH_STATE_CHANGED',
            user: minimalUser
          });
          
          sendResponse({ user: user });
        })
        .catch(error => {
          console.error("Authentication error:", error);
          sendResponse({ error: error.message });
        });
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