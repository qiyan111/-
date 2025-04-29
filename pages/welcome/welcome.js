const authService = require('../../utils/authService.js');

Page({
  data: {
    isLoading: false,
    isPrivacyAgreed: false
  },
  
  onLoad: function() {
    console.log('欢迎页面加载');
  },
  
  // 业主登录按钮点击事件
  ownerLogin: function() {
    console.log('开始业主登录流程');
    
    // 新增：检查用户是否已同意协议
    if (!this.data.isPrivacyAgreed) {
      wx.showToast({
        title: '请先阅读并同意用户协议和隐私政策',
        icon: 'none'
      });
      return; // 阻止后续流程
    }

    // 设置加载状态
    this.setData({ isLoading: true });
    
    // 第一步：获取用户信息(必须由用户点击触发)
    wx.getUserProfile({
      desc: '用于完成业主身份验证',
      success: async (res) => {
        console.log('获取用户信息成功:', res);
        
        try {
          // 第二步：获取登录凭证code
          const code = await authService.getLoginCode();
          console.log('获取登录凭证成功:', code);
          
          // 第三步：调用后端登录接口（这才是真正的登录）
          console.log('正在调用后端登录接口...');
          const loginResult = await authService.loginWithCodeAndUserInfo(code, res);
          console.log('后端登录接口调用成功:', loginResult);
          
          // 登录成功，跳转到选择小区页面
          wx.navigateTo({
            url: '/pages/selectCommunity/selectCommunity',
            success: () => console.log('成功跳转到小区选择页面'),
            fail: (err) => {
              console.error('跳转失败:', err);
              wx.showToast({ title: '跳转失败', icon: 'none' });
            }
          });
        } catch (error) {
          console.error('登录过程出错:', error);
          wx.showToast({
            title: error.message || '登录失败，请重试',
            icon: 'none'
          });
        } finally {
          this.setData({ isLoading: false });
        }
      },
      fail: (err) => {
        console.error('用户拒绝授权:', err);
        wx.showToast({
          title: '需要授权才能继续',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      }
    });
  },

  // 新增：处理隐私协议勾选状态变化
  handlePrivacyChange: function(e) {
    this.setData({
      isPrivacyAgreed: e.detail.value.includes('agree')
    });
  }
}) 