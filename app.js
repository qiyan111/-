const fs = wx.getFileSystemManager();

App({
  onLaunch: function() {
    // 加载自定义字体
    this.loadCustomFont();
    
    const token = wx.getStorageSync('token'); // 假设你的登录凭证存储在 'token'
    const selectedCommunity = wx.getStorageSync('selectedCommunity');

    console.log('onLaunch - Token:', token);
    console.log('onLaunch - Selected Community:', selectedCommunity);

    if (token && selectedCommunity) {
      // 如果已登录且已选择小区，跳转到首页 (TabBar页面)
      console.log('onLaunch: 已登录且已选小区，跳转到 index');
      wx.switchTab({
        url: '/pages/index/index'
      });
    } else if (token && !selectedCommunity) {
      // 如果已登录但未选择小区，跳转到选择小区页面
      console.log('onLaunch: 已登录但未选小区，跳转到 selectCommunity');
      wx.reLaunch({ // 使用 reLaunch 清除可能存在的旧页面栈
        url: '/pages/selectCommunity/selectCommunity'
      });
    } else {
       // 如果未登录，则停留在默认的启动页（现在是 welcome 页）或强制跳转到 welcome 页
       console.log('onLaunch: 未登录，停留在 welcome 或强制跳转');
       // 通常不需要强制跳转，因为 app.json 的 pages[0] 会处理
       // 如果需要确保总是从 welcome 开始，可以取消下面这行注释
       // wx.reLaunch({ url: '/pages/welcome/welcome' });
    }
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
  },

  globalData: {
    // ... 其他全局数据 ...
  }
})
// https://github.com/qiyan111/fonts-assets/raw/refs/heads/main/AlibabaPuHuiTiL.woff2