

export default defineBackground(() => {
  // Check if browser supports side panel API
  const hasSidePanelSupport = !!(browser as any).sidePanel && !!(browser as any).sidePanel.open;

  // Open side panel when extension icon is clicked
  browser.action.onClicked.addListener(() => {
    if (hasSidePanelSupport) {
      // Use side panel if supported
      browser.windows.getCurrent({ populate: true }, (window) => {
        (browser as any).sidePanel.open({ windowId: window.id });
      });
    } else {
      // Fallback: open standalone version in a new tab
      browser.tabs.create({ url: 'standalone.html' });
    }
  });

  // Log sidepanel support status to help with debugging
  console.log('Side Panel Support: ' + (hasSidePanelSupport ? 'Yes' : 'No'));
});
