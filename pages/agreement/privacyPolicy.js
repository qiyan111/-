Page({
  data: {
    statusBarHeight: 0 // 用于存储状态栏高度
  },
  onLoad: function (options) {
    // 获取状态栏高度
    try {
      const res = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: res.statusBarHeight
      });
    } catch (e) {
      // 处理获取失败的情况
      console.error('获取系统信息失败', e);
    }
  },
  // 其他页面生命周期函数...
}); 