Page({
  data: {
    messages: []
  },
  
  onLoad: function() {
    // 不要调用不存在的方法
    // 尝试初始化消息数据
    this.setData({
      messages: [
        // 可以添加一些默认消息
      ]
    });
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      });
    }
  }
}) 