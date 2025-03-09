// index.js
Page({
  data: {
    address: "住址信息......",
    notice: "信息信息信息信息信息......",
    noticeDate: "YYYY.MM.DD",
    latestMessage: "您有一条新的消息提醒...",
    currentTab: 0, // 当前选中的标签索引
    functions: [
      { id: 1, name: "门禁控制", icon: "/images/door.png", color: "#8B7ED8" },
      { id: 2, name: "访客通行", icon: "/images/visitor.png", color: "#5B9CF8" },
      { id: 3, name: "报事维修", icon: "/images/repair.png", color: "#3DCCCB" },
      { id: 4, name: "车位查询", icon: "/images/parking.png", color: "#FA9B4D" },
      { id: 5, name: "生活缴费", icon: "/images/payment.png", color: "#46D0A8" }
    ]
  },
  
  onLoad() {
    // 启动消息监听
    this.startMessageListener();
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0  // 首页的索引是 0
      })
    }
  },
  
  // 启动消息监听
  startMessageListener() {
    // 这里可以添加WebSocket连接或者轮询获取最新消息
    // 示例使用定时器模拟
    setInterval(() => {
      this.checkNewMessage();
    }, 30000); // 每30秒检查一次
  },
  
  // 检查新消息
  checkNewMessage() {
    // 这里应该调用后端API获取最新消息
    // 示例代码
    wx.request({
      url: 'your_api_url/latest_message',
      success: (res) => {
        if (res.data && res.data.message) {
          this.setData({
            latestMessage: res.data.message
          });
        }
      }
    });
  },
  
  // 点击功能按钮
  tapFunction(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `点击了${this.data.functions.find(item => item.id === id).name}`,
      icon: 'none'
    });
  },
  
  // 点击开门按钮
  tapOpenDoor() {
    wx.showToast({
      title: '正在开门...',
      icon: 'loading'
    });
  },
  
  // 点击棋牌室预约
  tapChessRoom() {
    wx.showToast({
      title: '棋牌室预约功能开发中',
      icon: 'none'
    });
  },
  
  // 点击组团约局
  tapGroupBooking() {
    wx.showToast({
      title: '组团约局功能开发中',
      icon: 'none'
    });
  },
  
  // 点击我的预约
  tapMyBooking() {
    wx.showToast({
      title: '我的预约功能开发中',
      icon: 'none'
    });
  },
  
  // 切换底部标签
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    this.setData({
      currentTab: index
    });
    
    // 根据不同的标签执行相应的操作
    switch(index) {
      case 0: // 首页
        break;
      case 1: // 社区
        break;
      case 2: // 开门
        this.tapOpenDoor();
        break;
      case 3: // 信息
        break;
      case 4: // 我的
        break;
    }
  },
})
