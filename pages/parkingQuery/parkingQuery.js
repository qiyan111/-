Page({
  data: {
    totalSpaces: 'XXXX',
    availableSpaces: 'XX'
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1  // 返回一级，即返回到首页
    });
  }
}) 