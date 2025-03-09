Page({
  data: {},
  openDoor: function() {
    wx.showToast({
      title: '正在开门...',
      icon: 'loading',
      duration: 2000
    });
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2  // 开门的索引是 2
      })
    }
  }
}) 