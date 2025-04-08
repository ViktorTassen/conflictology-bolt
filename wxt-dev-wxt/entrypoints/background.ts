export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  browser.action.onClicked.addListener(() => {
    browser.windows.getCurrent({ populate: true }, (window) => {
      (browser as any).sidePanel.open({ windowId: window.id });
    });
  });
});
