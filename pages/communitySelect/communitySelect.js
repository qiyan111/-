Page({
  data: {
    selectedCommunity: {}, // 初始化为空对象，而不是null
    communities: [
      {
        id: 1,
        name: '骏文雅苑',
        address: '广东省广州市番禺区文博路 113 号'
      },
      {
        id: 2,
        name: '小区名称',
        address: '具体地址XXXXXXXXXXXX'
      },
      {
        id: 3,
        name: '小区名称',
        address: '具体地址XXXXXXXXXXXX'
      },
      {
        id: 4,
        name: '小区名称',
        address: '具体地址XXXXXXXXXXXX'
      }
    ]
  },

  onLoad: function() {
    console.log('选择小区页面加载');
    
    // 默认选中第一个小区
    this.setData({
      selectedCommunity: this.data.communities[0]
    });
  },

  onShow: function() {
    console.log('选择小区页面显示');
  },

  // 选择小区列表的小区
  selectCommunity: function(e) {
    const communityId = parseInt(e.currentTarget.dataset.id);
    const community = this.data.communities.find(item => item.id === communityId);
    
    if (community) {
      this.setData({
        selectedCommunity: community
      });
      
      // 如果选择了列表中的小区，直接确认
      if (communityId === 1) {
        // 如果是第一个小区(蓝色按钮)，可以直接确认
        this.confirmSelection();
      }
    }
  },

  // 确认选择
  confirmSelection: function() {
    if (!this.data.selectedCommunity || !this.data.selectedCommunity.id) {
      wx.showToast({
        title: '请选择小区',
        icon: 'none'
      });
      return;
    }

    // 保存选择的小区信息
    wx.setStorageSync('selectedCommunity', this.data.selectedCommunity);
    
    // 跳转到首页
    wx.switchTab({
      url: '/pages/index/index',
      success: function() {
        console.log('成功跳转到首页');
      },
      fail: function(error) {
        console.error('跳转到首页失败:', error);
      }
    });
  }
}) 