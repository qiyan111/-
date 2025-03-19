// 引入认证服务
const authService = require('../../utils/authService');

Page({
  data: {
    errorMsg: '',
    isLoading: false,
    loginCode: '' // 存储登录凭证
  },
  
  onLoad() {
    console.log('登录页面加载');
    // 检查是否已登录，如果已登录则跳转到首页
    if (authService.checkLoginStatus()) {
      console.log('用户已登录，跳转到首页');
      wx.switchTab({
        url: '/pages/index/index'
      });
    } else {
      console.log('用户未登录，显示登录页面');
      // 预先获取登录凭证
      this.getLoginCode();
    }
  },
  
  // 获取登录凭证
  getLoginCode() {
    authService.getLoginCode()
      .then(code => {
        console.log('预先获取登录凭证成功:', code);
        this.setData({ loginCode: code });
      })
      .catch(err => {
        console.error('预先获取登录凭证失败:', err);
        this.setData({ errorMsg: '获取登录凭证失败，请重试' });
      });
  },
  
  // 微信登录
  handleLogin() {
    console.log('用户点击登录按钮');
    this.setData({ 
      isLoading: true,
      errorMsg: '' 
    });
    
    // 直接在用户点击事件中调用 getUserProfile
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (userInfo) => {
        console.log('获取用户信息成功');
        
        // 如果没有预先获取到登录凭证，重新获取
        if (!this.data.loginCode) {
          authService.getLoginCode()
            .then(code => {
              return authService.loginWithCode(code, userInfo);
            })
            .then(this.handleLoginSuccess)
            .catch(this.handleLoginFail);
        } else {
          // 使用预先获取的登录凭证
          authService.loginWithCode(this.data.loginCode, userInfo)
            .then(this.handleLoginSuccess)
            .catch(this.handleLoginFail);
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        this.setData({
          isLoading: false,
          errorMsg: '获取用户信息失败，请授权后重试'
        });
      }
    });
  },
  
  // 处理登录成功
  handleLoginSuccess: function(res) {
    console.log('登录成功，返回数据:', res);
    this.setData({ isLoading: false });
    
    // 登录成功，跳转到首页
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      }
    });
  },
  
  // 处理登录失败
  handleLoginFail: function(err) {
    console.error('登录失败:', err);
    this.setData({
      isLoading: false,
      errorMsg: err.msg || '登录失败，请稍后重试'
    });
    
    // 登录失败后，重新获取登录凭证
    this.getLoginCode();
  },
  
  // 显示用户协议
  showAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    });
  },
  
  // 显示隐私政策
  showPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  }
}); 