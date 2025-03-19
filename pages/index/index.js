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
    const functionItem = e.currentTarget.dataset.function;
    
    // 根据功能ID执行不同操作
    switch(functionItem.name) {
      case '车位查询':
        this.navigateToParkingQuery();
        break;
      case '门禁控制':
        // 跳转到门禁控制页面
        this.navigateToDoorControl();
        break;
      case '访客通行':
        this.navigateToVisitorPass();
        break;
      case '报事维修':
        // 处理报事维修
        this.navigateToRepair();
        break;
      case '生活缴费':
        // 处理生活缴费
        this.navigateToPayment();
        break;
      default:
        wx.showToast({
          title: `点击了${functionItem.name}`,
          icon: 'none'
        });
    }
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
  
  // 添加跳转方法
  navigateToParkingQuery() {
    wx.navigateTo({
      url: '/pages/parkingQuery/parkingQuery'
    })
  },
  
  // 添加生活缴费页面跳转方法
  navigateToPayment() {
    wx.navigateTo({
      url: '/pages/payment/payment'
    })
  },
  
  // 添加门禁控制页面跳转方法
  navigateToDoorControl() {
    wx.navigateTo({
      url: '/pages/doorControl/doorControl'
    })
  },
  navigateToRepair(){
    wx.navigateTo({
      url: '/pages/repair/prerepair',
      success: function() {
        console.log('跳转成功');
      },
      fail: function(error) {
        console.error('跳转失败：', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    })
  },
  navigateToVisitorPass() {
    wx.navigateTo({
      url: '/pages/visitorPass/visitorPass'
    })
  }
})
