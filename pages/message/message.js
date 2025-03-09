Page({
  data: {},
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3  // 信息的索引是 3
      })
    }
  }
}) 