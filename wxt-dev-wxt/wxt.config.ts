import { defineConfig, defineWebExtConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  runner: defineWebExtConfig({
    disabled: true,
  }),
  manifest: {
    name: 'Coup Card Game',
    description: 'Play Coup card game with your friends using Chrome extension',
    version: '1.0.0',
    permissions: ['storage', 'sidePanel'],
    action: {
      default_title: 'Coup Card Game'
    },
    side_panel: {
      default_path: 'sidepanel.html'
    },
    web_accessible_resources: [
      {
        resources: ['sidepanel/*', 'standalone.html'],
        matches: ['<all_urls>']
      }
    ]
  },
});