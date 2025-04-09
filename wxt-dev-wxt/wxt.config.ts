import { defineConfig, defineWebExtConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  runner: defineWebExtConfig({
    disabled: true,
  }),
  manifest: {
    name: 'Conflictology: Play with Friends on Zoom, Meet, Teams – Inspired by Coup',
    description: 'Bluff, deceive, and outplay in this Coup-style game for Zoom, Meet & Teams. Great for fun team building and remote hangouts.',
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
    oauth2: {
      client_id: "205495071119-9pj26njnj1p9ucj2mh5jbv43ib3t26ld.apps.googleusercontent.com",
      scopes: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ]
    }
  },
});