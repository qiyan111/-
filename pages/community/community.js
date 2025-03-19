Page({
  data: {},
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1  // 社区的索引是 1
      })
    }
  },
  
  // 点击棋牌室预约
  tapChessRoom: function() {
    wx.navigateTo({
      url: '/pages/chessRoomBooking/chessRoomBooking'
    })
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
  }
}) 