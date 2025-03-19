Page({
  data: {
    doorList: [
      {
        name: "小区大门",
        id: "main_gate",
        status: "可开启"
      },
      {
        name: "1号楼门",
        id: "building1",
        status: "可开启"
      },
      {
        name: "小区侧门",
        id: "side_gate",
        status: "可开启"
      }
    ]
  },
  
  onLoad: function() {
    // 初始化数据，不要调用可能不存在的方法
  },
  
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2 // 开门的索引是2
      });
    }
  },
  
  // 安全的打开门方法
  openDoor: function(e) {
    const doorId = e.currentTarget.dataset.id;
    if (!doorId) {
      wx.showToast({
        title: '无效的门ID',
        icon: 'none'
      });
      return;
    }
    
    // 处理开门逻辑
    wx.showLoading({
      title: '正在开门...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '开门成功',
        icon: 'success'
      });
    }, 1500);
  }
}) 