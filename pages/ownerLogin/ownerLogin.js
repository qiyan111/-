const authService = require('../../utils/authService.js'); // 引入认证服务

Page({
  data: {
    username: '',
    password: '',
    showPassword: false,
    isLoading: false
  },
  
  onLoad: function() {
    console.log('业主登录页面加载');
  },
  
  // 输入用户名
  onInputUsername: function(e) {
    this.setData({
      username: e.detail.value
    });
  },
  
  // 输入密码
  onInputPassword: function(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  // 登录按钮点击事件
  login: async function() {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    try {
      console.log('ownerLogin: 开始调用 authService.login');
      const loginResult = await authService.login();
      console.log('ownerLogin: authService.login 调用成功', loginResult);

      wx.navigateTo({
        url: '/pages/selectCommunity/selectCommunity',
        success: () => {
          console.log('成功跳转到选择小区页面');
        },
        fail: (error) => {
          console.error('跳转到选择小区页面失败:', error);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });

    } catch (error) {
      console.error('ownerLogin: authService.login 调用失败', error);
      wx.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },
  
  // 切换密码显示/隐藏
  togglePasswordVisibility: function() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },
  
  // 处理获取用户信息按钮的点击事件
  handleGetUserInfo: async function(e) { 
    if (this.data.isLoading) return; // 防止重复点击

    console.log('handleGetUserInfo 事件触发:', e.detail);

    // 检查用户是否授权
    if (e.detail.userInfo) {
      console.log('用户已授权，获取用户信息成功');
      this.setData({ isLoading: true }); // 开始加载
      
      try {
        // 1. 获取登录凭证 code
        console.log('开始获取登录 code...');
        const code = await authService.getLoginCode();
        console.log('获取登录 code 成功:', code);

        // 2. 使用 code 和用户信息调用后端登录接口
        //    e.detail 包含了 rawData, signature 等必要信息
        console.log('开始调用后端登录接口...');
        const loginResult = await authService.loginWithCodeAndUserInfo(code, e.detail); 
        console.log('后端登录成功:', loginResult);

        // 登录成功后，authService 内部已保存 token
        // 跳转到选择小区页面
        wx.navigateTo({
          url: '/pages/selectCommunity/selectCommunity',
          success: () => console.log('成功跳转到选择小区页面'),
          fail: (err) => console.error('跳转选择小区失败:', err)
        });

      } catch (error) {
        // 处理获取 code 或调用后端接口时的错误
        console.error('登录流程中发生错误:', error);
        wx.showToast({
          title: error.message || '登录失败，请稍后重试',
          icon: 'none',
          duration: 2500
        });
      } finally {
        this.setData({ isLoading: false }); // 结束加载
      }

    } else {
      // 用户拒绝授权
      console.log('用户拒绝授权');
      wx.showToast({
        title: '您拒绝了授权，无法登录',
        icon: 'none'
      });
    }
  }
}) 