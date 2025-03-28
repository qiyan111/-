const fs = wx.getFileSystemManager();

App({
  onLaunch: function() {
    // 加载自定义字体
    this.loadCustomFont();
  },
  
  loadCustomFont: function() {
    wx.loadFontFace({
      family: 'AlibabaPuHuiTi',
      source: 'url("https://cdn.jsdelivr.net/gh/qiyan111/fonts-assets/raw/refs/heads/main/AlibabaPuHuiTiL.woff2")',
      success: function(res) {
        console.log('字体加载成功', res);
        wx.setStorageSync('fontLoaded', true);
      },
      fail: function(res) {
        console.log('字体加载失败', res);
        // 可以在这里添加备用方案，例如加载Base64编码的字体
      },
      complete: function() {
        // 无论成功失败都执行的代码
      }
    });
  }
})
// https://github.com/qiyan111/fonts-assets/raw/refs/heads/main/AlibabaPuHuiTiL.woff2