Page({
  data: {
    residentType: 'owner', // 默认选中 'owner' (业主/家属)
    phoneNumber: '',
    isLoading: false,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight, // 获取状态栏高度用于自定义导航栏
    headerHeight: 0 // 用于存储计算后的整个头部高度
  },

  onLoad: function() {
    // 计算头部区域高度（状态栏 + 导航栏）
    try {
      const res = wx.getSystemInfoSync();
      const statusBarHeight = res.statusBarHeight;
      const navBarHeight = 44; // 固定的导航栏高度
      const headerHeight = statusBarHeight + navBarHeight + 20; // 额外加20作为安全距离
      
      console.log('计算的头部高度:', headerHeight);
      
      this.setData({
        headerHeight: headerHeight
      });
    } catch (e) {
      // 如果获取失败，使用一个固定值
      this.setData({
        headerHeight: 120 // 一个保守估计的高度
      });
    }
  },

  // 处理住户类型选择
  selectResidentType(e) {
    this.setData({
      residentType: e.currentTarget.dataset.type
    });
  },

  // 处理手机号输入
  inputPhoneNumber(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 申请认证
  applyAuth() {
    const { phoneNumber } = this.data;

    // 简单的手机号格式校验
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      });
      return;
    }

    // 从缓存获取 Token
     const token = wx.getStorageSync('token');
 
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      // 可以选择跳转到登录页
       wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    // 从缓存获取用户选择的小区信息
    const selectedCommunity = wx.getStorageSync('selectedCommunity');
    if (!selectedCommunity || !selectedCommunity.id) {
      wx.showToast({
        title: '请先选择小区',
        icon: 'none'
      });
      // 可以跳转到选择小区页面
      // wx.navigateTo({ url: '/pages/selectCommunity/selectCommunity' });
      return;
    }

    this.setData({ isLoading: true });

    // 调用后端接口
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/authentication/apply',
      method: 'POST',
      header: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
        'Connection': 'keep-alive',
        'Authorization':token, // 使用从缓存获取的真实token
        'communityId': selectedCommunity.id.toString() // 使用选择的小区 id，并确保转为字符串
      },
      data: {
        phoneNumber: phoneNumber
      },
      success: (res) => {
        console.log('申请认证结果:', res);
        // 注意：现在需要同时检查 statusCode 和业务 code
        if (res.statusCode === 200 && res.data && res.data.code === "200") {
          wx.showToast({
            title: res.data.msg || '申请成功',
            icon: 'success',
            duration: 2000,
            complete: () => {
              // 成功后可以考虑跳转或执行其他操作
              // wx.navigateBack();
            }
          });
        } else if (res.statusCode === 200 && res.data && res.data.code === "40100") {
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
        } else {
          // 处理其他后端返回的错误信息
          wx.showToast({
            title: (res.data && res.data.msg) || '申请失败，请稍后重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('申请认证请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
}) 