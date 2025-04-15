/**
 * 一码通服务
 * 封装与一码通相关的所有接口请求
 */

// 引入认证服务
const authService = require('./authService');
const app = getApp();
const request = require('./request'); // 一个请求工具

/**
 * 确保用户已登录
 * @returns {Promise} 登录状态的Promise
 */
const ensureLogin = async () => {
  const token = authService.getToken();
  if (!token) {
    console.log('未检测到登录状态，尝试自动登录');
    try {
      await authService.login();
      console.log('自动登录成功');
      return true;
    } catch (err) {
      console.error('自动登录失败:', err);
      throw new Error('请先登录');
    }
  }
  return true;
};

/**
 * 获取二维码
 * @returns {Promise} 包含二维码数据的Promise
 */
const getQrCode = async () => {
  console.log('开始执行getQrCode函数');
  
  // 检查登录状态
  const rawToken = wx.getStorageSync('token');
  console.log('原始token值:', rawToken);
  
  // 确保token格式正确，去除可能重复的Bearer前缀
  let token = rawToken;
  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }
  // 现在给token添加正确的Bearer前缀
  token = token ? `Bearer ${token}` : '';
  
  console.log('处理后的token:', token);
  
  if (!token) {
    console.error('未检测到token，用户未登录');
    return Promise.reject({ message: '未登录' });
  }
  
  // 获取已选择的小区信息
  const selectedCommunity = wx.getStorageSync('selectedCommunity');
  console.log('从Storage获取的小区信息:', JSON.stringify(selectedCommunity));
  
  if (!selectedCommunity || !selectedCommunity.id) {
    console.error('未选择小区或小区信息不完整');
    return Promise.reject({ message: '请先选择小区' });
  }
  
  const communityId = selectedCommunity.id;
  console.log('将要使用的小区ID:', communityId);
  
  // 检查communityId的有效性
  if (!communityId) {
    console.error('警告: communityId为空或无效:', communityId);
  } else {
    console.log('communityId数据类型:', typeof communityId);
  }
  
  // 构建请求头
  const headers = {
    'Authorization': token, // 使用处理后的token，不再添加'token'字段
    'communityId': communityId
  };
  console.log('完整的请求头信息:', JSON.stringify(headers));
  
  // 返回请求并添加日志
  return request({
    url: '/qrcode/get',
    method: 'POST',
    header: headers  // 使用header而不是headers 
  }).then(response => {
    console.log('获取二维码成功，响应数据:', JSON.stringify(response));
    return response;
  }).catch(error => {
    console.error('获取二维码失败，错误信息:', JSON.stringify(error));
    console.error('请求参数回顾 - token:', token, 'communityId:', communityId);
    throw error;
  });
};

/**
 * 生成二维码图片
 * @param {String} qrId - 二维码ID
 * @returns {Promise} 包含二维码图片的Promise
 */
const generateQRCode = (qrId) => {
  console.log('生成二维码图片，ID:', qrId);
  
  // 使用在线服务生成二维码
  return new Promise((resolve) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrId)}`;
    console.log('二维码图片URL:', qrCodeUrl);
    resolve(qrCodeUrl);
  });
};

/**
 * 验证二维码
 * @param {String} qrId - 二维码ID
 * @returns {Promise} 验证结果的Promise
 */
const verifyQrCode = async (qrId) => {
  try {
    await ensureLogin();
    console.log('=== 开始验证二维码 ===');
    
    const token = authService.getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    // 获取用户选择的小区信息
    const selectedCommunity = wx.getStorageSync('selectedCommunity');
    if (!selectedCommunity || !selectedCommunity.id) {
      console.error('未选择小区，终止请求');
      throw new Error('请先选择小区');
    }
    
    const communityId = selectedCommunity.id.toString();
    console.log('使用小区ID:', communityId);
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: `https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/qrcode/verify/${qrId}`,
        method: 'POST',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
          'Connection': 'keep-alive',
          'communityId': communityId // 添加小区ID
        },
        success: (res) => {
          console.log('验证二维码响应:', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('验证二维码请求失败:', err);
          reject(err);
        },
        enableHttp2: false,
        enableQuic: false,
        enableCache: false
      });
    });
    
    if (response.statusCode !== 200) {
      throw new Error('验证二维码失败，服务器错误');
    }
    
    const data = response.data;
    
    if (data.code === "200") {
      return data.data || data;
    } else {
      throw new Error(data.message || '验证失败');
    }
  } catch (error) {
    console.error('验证二维码失败:', error);
    throw error;
  }
};

// 获取 token 的函数
const getToken = () => {
  return wx.getStorageSync('token') || '';
};

// 刷新 token 的函数
const refreshToken = () => {
  return new Promise((resolve, reject) => {
    // 使用 refreshToken 获取新的 token
    const refreshToken = wx.getStorageSync('refreshToken');
    if (!refreshToken) {
      // 如果没有 refreshToken，直接跳转到登录页
      navigateToLogin();
      reject(new Error('没有刷新令牌'));
      return;
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/auth/refresh`,
      method: 'POST',
      data: { refreshToken },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          // 保存新的 token
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('refreshToken', res.data.data.refreshToken);
          resolve(res.data.data.token);
        } else {
          // 刷新失败，跳转到登录页
          navigateToLogin();
          reject(new Error('刷新令牌失败'));
        }
      },
      fail: (err) => {
        navigateToLogin();
        reject(err);
      }
    });
  });
};

// 跳转到登录页
const navigateToLogin = () => {
  wx.showModal({
    title: '登录已过期',
    content: '您的登录状态已过期，请重新登录',
    showCancel: false,
    success: () => {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  });
};

// 处理请求的函数，包含 token 刷新逻辑
const handleRequest = async (url, method, data, retryCount = 0) => {
  try {
    const token = getToken();
    const response = await request({
      url,
      method,
      data,
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response;
  } catch (error) {
    // 如果是 401 错误且未超过重试次数
    if (error.code === 401 && retryCount < 1) {
      try {
        // 刷新 token
        await refreshToken();
        // 使用新 token 重试请求
        return handleRequest(url, method, data, retryCount + 1);
      } catch (refreshError) {
        throw refreshError;
      }
    }
    
    throw error;
  }
};

// 导出函数
module.exports = {
  getQrCode,
  generateQRCode,
  verifyQrCode
};