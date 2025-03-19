Page({
  data: {
    activeTab: 0, // 0: 待缴费, 1: 已缴费
    bills: [
      {
        id: '1',
        billNo: 'XXXXXXXXXXXX',
        billType: '水电费',
        detail: '用水 XX吨，用电 XX度',
        period: 'X月X日-X月X日',
        amount: 'XX'
      }
    ],
    // bills: [] // 如需显示无账单状态可以使用空数组
  },
  
  onLoad() {
    // 模拟获取缴费数据
    this.fetchBillData();
  },
  
  // 获取账单数据
  fetchBillData() {
    // 这里以后将替换为实际的API调用
    // 示例数据
    if (this.data.activeTab === 0) {
      // 待缴费数据
      this.setData({
        bills: [
          {
            id: '1',
            billNo: 'XXXXXXXXXXXX',
            billType: '水电费',
            detail: '用水 XX吨，用电 XX度',
            period: 'X月X日-X月X日',
            amount: 'XX'
          }
        ]
      });
    } else {
      // 已缴费数据 - 为空以显示暂无消息
      this.setData({
        bills: []
      });
    }
  },
  
  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    console.log('切换到标签:', index);
    this.setData({
      activeTab: index
    });
    
    // 根据不同标签加载不同数据
    this.fetchBillData();
  },
  
  // 点击缴费按钮
  payBill(e) {
    const billId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '缴费功能开发中',
      icon: 'none'
    });
  },
  
  // 返回上一页
  navigateBack() {
    console.log('返回按钮被点击');
    wx.navigateBack({
      delta: 1,
      fail: function() {
        // 如果返回失败，则回到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  }
}) 