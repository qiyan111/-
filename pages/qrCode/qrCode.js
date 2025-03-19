// 引入一码通服务
const qrCodeService = require('../../utils/qrCodeService');
const authService = require('../../utils/authService');

Page({
  data: {
    qrCodeUrl: '', // 存放后端生成的二维码URL
    isLoading: true,
    errorMsg: '',
    showAuthButton: false // 是否显示授权按钮
  },
  
  onLoad() {
    this.getQrCode();
  },
  
  // 获取二维码
  getQrCode() {
    this.setData({
      isLoading: true,
      errorMsg: '',
      showAuthButton: false
    });
    
    // 检查登录状态
    if (!authService.checkLogin()) {
      // 显示授权按钮
      this.setData({
        isLoading: false,
        showAuthButton: true
      });
    } else {
      this.fetchQrCode();
    }
  },
  
  // 获取一码通二维码
  fetchQrCode() {
    return qrCodeService.getQrCode()
      .then(res => {
        console.log('获取二维码成功:', res);
        // 使用 id 构建二维码 URL
        const qrCodeUrl = `https://property.suyiiyii.top/qrcode/show/${res.id}`;
        
        this.setData({
          qrCodeUrl: qrCodeUrl,
          isLoading: false,
          errorMsg: '',
          showAuthButton: false  // 确保授权按钮被隐藏
        });
      })
      .catch(err => {
        console.error('获取二维码失败:', err);
        if (err.code === 401) {
          this.setData({
            isLoading: false,
            errorMsg: '登录已过期，请重新授权',
            showAuthButton: true
          });
        } else {
          this.setData({
            isLoading: false,
            errorMsg: err.message || '获取二维码失败，请重试'
          });
        }
        throw err;
      });
  },
  
  // 导航返回
  navigateBack() {
    wx.navigateBack();
  },
  
  // 处理用户点击授权按钮
  handleAuth() {
    this.setData({ 
      isLoading: true,
      errorMsg: '',
      showAuthButton: false  // 立即隐藏授权按钮
    });

    // 先获取用户信息
    wx.getUserProfile({
      desc: '需要您的授权才能使用开门功能',
      success: (userInfo) => {
        // 获取到用户信息后，获取登录凭证
        authService.getLoginCode()
          .then(code => {
            // 使用 code 和用户信息登录
            return authService.loginWithCodeAndUserInfo(code, userInfo);
          })
          .then(() => {
            // 登录成功后立即获取二维码
            return this.fetchQrCode();
          })
          .catch(err => {
            console.error('登录失败:', err);
            this.setData({
              isLoading: false,
              errorMsg: err.message || '登录失败，请重试',
              showAuthButton: true
            });
          });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        this.setData({
          isLoading: false,
          errorMsg: '您需要授权才能使用开门功能',
          showAuthButton: true
        });
      }
    });
  }
});