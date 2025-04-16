import { defineConfig, defineWebExtConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  runner: defineWebExtConfig({
    disabled: true,
  }),
  manifest: {
    name: 'Conflictology: play on Zoom, Meet, Teams – virtual meeting card game',
    description: 'Coup-inspired social deduction card game. A perfect icebreaker for virtual team building or fun remote play with friends.',
    version: '1.0.0',
    permissions: ['storage', 'sidePanel', 'identity', 'offscreen'],
    action: {
      default_title: 'Conflictology: Capitol'
    },
    side_panel: {
      default_path: 'sidepanel.html'
    },
    web_accessible_resources: [
      {
        resources: ['sidepanel/*', 'standalone.html', 'offscreen/*'],
        matches: ['<all_urls>']
      }
    ],
    host_permissions: [
      "https://conflictology-web.vercel.app/*",
      "https://conflictologygames.com/*",
      "https://meet.google.com/*",
      "https://teams.microsoft.com/*",
      "https://*.zoom.us/*",
      "https://*.zoom.com/*",
      "https://conflictology-conflict.web.app/*",
      "https://conflictology-conflict.firebaseapp.com/*",
    ],
    oauth2: {
      client_id: "205495071119-pd719c75qidt7j9mg5hanpvldbohs3aq.apps.googleusercontent.com",
      scopes: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ]
    }
  },
});