Page({
  data: {
    totalSpaces: 'XXXX',
    availableSpaces: 'XX'
  },
  
  onLoad: function() {
    this.getParkingData();
  },
     
  
 
  getParkingData: function() {
    // 从缓存获取 Token
    const token = wx.getStorageSync('token');
    // 设置接口请求头
    let header = {
      'communityId': '1',
      'Authorization': token,
      'Accept': '*/*'
    };

    // 请求车位数据
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/parking/get',
      method: 'GET',
      header: header,
      success: (res) => {
        console.log('车位数据接口返回:', res.data);
        
        // 判断是否成功获取数据
        if (res.data.code === "200" && res.data.data) {
          this.setData({
            totalSpaces: res.data.data.spaceNum || 0,    // 使用 spaceNum 作为总车位数
            availableSpaces: res.data.data.freeNum || 0  // 使用 freeNum 作为空闲车位数
          });
        } else {
          console.error('获取车位数据异常:', res);
          if (res.statusCode === 200 && res.data && res.data.code === "40100") {
            // 特殊处理 401 错误
            wx.showToast({
              title: '登录已过期，请重新登录', // 更明确的提示
              icon: 'none',
              duration: 2000,
              complete: () => {
                // 跳转到登录页 (使用reLaunch清空页面栈)
                wx.reLaunch({ url: "/pages/welcome/welcome" });
              }
            });
          }
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('车位数据请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  }
}) 