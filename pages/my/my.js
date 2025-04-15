Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '用户名称',
      id: 'XXXXXXXXXX'
    }
  },
  onLoad: function() {
    // 这里可以获取用户信息
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4  // 我的的索引是 4
      })
    }
  },

  // 跳转到住户认证页面
  navigateToAuth() {
    wx.navigateTo({
      url: '/pages/residentAuth/residentAuth'
    })
  }
}) 