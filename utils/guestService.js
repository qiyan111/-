/**
 * 访客服务
 * 封装与访客申请相关的所有接口请求
 */

// 引入认证服务
const authService = require('./authService');

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
 * 提交访客申请
 * @param {Object} formData - 访客申请表单数据
 * @param {String} communityId - 社区ID，默认为1
 * @returns {Promise} 包含提交结果的Promise
 */
const submitGuestForm = async (formData, communityId = '1') => {
  try {
    console.log('=== 开始提交访客申请 ===');
    const token = authService.getToken();
    
    if (!token) {
      console.error('未获取到token，无法提交访客申请');
      throw new Error('请先登录');
    }
    
    console.log('提交访客申请，表单数据:', formData);
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/guest/form',
        method: 'POST',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
          'Connection': 'keep-alive',
          'communityId': communityId // 添加communityId头
        },
        data: formData || {}, // 即使是空对象也要传递
        success: (res) => {
          console.log('提交访客申请响应:', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('提交访客申请失败:', err);
          reject(err);
        },
        enableHttp2: false,
        enableQuic: false,
        enableCache: false
      });
    });
    
    // 处理响应
    if (response.statusCode !== 200) {
      console.error('请求状态码异常:', response.statusCode);
      throw new Error('提交访客申请失败，服务器错误');
    }
    
    const data = response.data;
    console.log('访客申请响应数据:', data);
    
    if (data.code === "200" && data.message === "success") {
      return data.data || { success: true };
    } else {
      throw new Error(data.message || '提交访客申请失败');
    }
  } catch (error) {
    console.error('提交访客申请失败:', error);
    throw error;
  }
};

/**
 * 获取访客申请列表
 * @param {String} communityId - 社区ID，默认为1
 * @returns {Promise} 包含访客申请列表的Promise
 */
const getGuestFormList = async (communityId = '1') => {
  try {
    console.log('=== 开始获取访客申请列表 ===');
    const token = authService.getToken();
    
    if (!token) {
      console.error('未获取到token，无法获取访客申请列表');
      throw new Error('请先登录');
    }
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/guest/list',
        method: 'GET',
        header: {
          'Authorization': token,
          'Accept': '*/*',
          'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
          'Connection': 'keep-alive',
          'communityId': communityId
        },
        success: (res) => {
          console.log('获取访客申请列表响应:', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('获取访客申请列表失败:', err);
          reject(err);
        },
        enableHttp2: false,
        enableQuic: false,
        enableCache: false
      });
    });
    
    // 处理响应
    if (response.statusCode !== 200) {
      console.error('请求状态码异常:', response.statusCode);
      throw new Error('获取访客申请列表失败，服务器错误');
    }
    
    const data = response.data;
    console.log('访客申请列表响应数据:', data);
    
    if (data.code === "200") {
      return data.data || [];
    } else {
      throw new Error(data.message || '获取访客申请列表失败');
    }
  } catch (error) {
    console.error('获取访客申请列表失败:', error);
    throw error;
  }
};

/**
 * 获取访客申请详情
 * @param {String} formId - 申请表单ID
 * @param {String} communityId - 社区ID，默认为1
 * @returns {Promise} 包含访客申请详情的Promise
 */
const getGuestFormDetail = async (formId, communityId = '1') => {
  try {
    console.log('=== 开始获取访客申请详情 ===');
    const token = authService.getToken();
    
    if (!token) {
      console.error('未获取到token，无法获取访客申请详情');
      throw new Error('请先登录');
    }
    
    if (!formId) {
      console.error('未提供formId，无法获取访客申请详情');
      throw new Error('请提供有效的表单ID');
    }
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: `https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/guest/detail/${formId}`,
        method: 'GET',
        header: {
          'Authorization': token,
          'Accept': '*/*',
          'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
          'Connection': 'keep-alive',
          'communityId': communityId
        },
        success: (res) => {
          console.log('获取访客申请详情响应:', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('获取访客申请详情失败:', err);
          reject(err);
        },
        enableHttp2: false,
        enableQuic: false,
        enableCache: false
      });
    });
    
    // 处理响应
    if (response.statusCode !== 200) {
      console.error('请求状态码异常:', response.statusCode);
      throw new Error('获取访客申请详情失败，服务器错误');
    }
    
    const data = response.data;
    console.log('访客申请详情响应数据:', data);
    
    if (data.code === "200") {
      return data.data || {};
    } else {
      throw new Error(data.message || '获取访客申请详情失败');
    }
  } catch (error) {
    console.error('获取访客申请详情失败:', error);
    throw error;
  }
};

/**
 * 根据访客码ID生成二维码
 * @param {String} guestCodeId - 访客码ID
 * @returns {Promise} 包含二维码图片URL的Promise
 */
const generateGuestQRCode = (guestCodeId) => {
  // 使用在线服务生成二维码
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guestCodeId)}`;
  
  return new Promise((resolve) => {
    console.log('生成访客二维码URL:', qrCodeUrl);
    resolve(qrCodeUrl);
  });
};

// 导出函数
module.exports = {
  submitGuestForm,
  getGuestFormList,
  getGuestFormDetail,
  generateGuestQRCode
};