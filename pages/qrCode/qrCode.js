// 引入一码通服务
const qrCodeService = require('../../utils/qrCodeService');
const authService = require('../../utils/authService');

Page({
  data: {
    qrId: '',
    qrImagePath: '',
    isLoading: true,
    errorMsg: '',
    showAuthButton: false // 是否显示授权按钮
  },
  
  onLoad() {
    this.getQrCode();
  },
  
  // 获取二维码
  getQrCode() {
    console.log('=== 开始获取二维码流程 ===');
    this.setData({
      isLoading: true,
      errorMsg: '',
      showAuthButton: false
    });
    
    // 检查登录状态
    const isLoggedIn = authService.checkLogin();
    console.log('登录状态:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('用户未登录，显示授权按钮');
      this.setData({
        isLoading: false,
        showAuthButton: true
      });
    } else {
      console.log('用户已登录，开始获取二维码');
      this.fetchQrCode();
    }
  },
  
  // 获取一码通二维码
  fetchQrCode() {
    console.log('=== 开始调用 getQrCode 服务 ===');
    return qrCodeService.getQrCode()
      .then(res => {
        console.log('获取二维码成功，返回数据:', res);
        this.setData({
          qrId: res.id,
          isLoading: false,
          errorMsg: '',
          showAuthButton: false
        });
        
        // 使用ID生成二维码
        return this.generateQrCodeImage(res.id);
      })
      .catch(err => {
        console.error('获取二维码失败，错误信息:', err);
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
  
  // 生成二维码图片
  generateQrCodeImage(qrId) {
    console.log('=== 开始生成二维码图片 ===');
    console.log('二维码ID:', qrId);
    
    if (!qrId) {
      console.error('没有二维码ID，无法生成图片');
      this.setData({
        isLoading: false,
        errorMsg: '获取二维码失败，请重试'
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    qrCodeService.generateQRCode(qrId)
      .then(imagePath => {
        console.log('生成二维码图片成功，图片路径:', imagePath);
        this.setData({
          qrImagePath: imagePath,
          isLoading: false
        });
      })
      .catch(err => {
        console.error('生成二维码图片失败:', err);
        // 使用备用方法
        const backupQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrId)}`;
        console.log('使用备用二维码URL:', backupQrUrl);
        
        this.setData({
          qrImagePath: backupQrUrl,
          isLoading: false
        });
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
  },
  
  // 刷新二维码
  refreshQrCode() {
    this.getQrCode();
  },
  
  // 处理图片加载错误
  handleImageError(e) {
    console.error('二维码图片加载失败:', e);
    const backupQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.data.qrId)}`;
    this.setData({
      qrImagePath: backupQrUrl
    });
  }
});