 /**
 * 访客服务
 * 封装与访客相关的所有接口请求
 */

// 引入认证服务
const authService = require('./authService');

/**
 * 提交访客申请
 * @param {Object} formData 访客申请表单数据
 * @param {string} formData.guestName - 访客姓名
 * @param {string} formData.guestPhone - 访客手机号
 * @param {string} formData.visitReason - 访问原因
 * @param {string} formData.visitTime - 访问时间
 * @returns {Promise} 包含访客码数据的Promise
 */
const submitGuestForm = (formData) => {
  return new Promise((resolve, reject) => {
    console.log('开始提交访客申请...');
    
    // 使用硬编码的 token
    const token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIiwiZXhwIjoxODQyMDQ3MTc2fQ.eR8U4B92t6xoRjzKocEThKpVV3q674vb_oekgwgOr1Q';
    console.log('使用硬编码 token:', token);
    
    wx.request({
      url: 'https://property.suyiiyii.top/guest/form',
      method: 'POST',
      header: {
        'Authorization': token,
        'Accept': '*/*',
        'Host': 'property.suyiiyii.top',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json'
      },
      data: formData || {}, // 如果没有提供表单数据，则发送空对象
      success: (res) => {
        console.log('访客申请响应:', res);
        if (res.statusCode === 200 && res.data.code === "200") {
          // 如果成功提交访客申请
          console.log('成功提交访客申请:', res.data.data);
          resolve(res.data.data);
        } else if (res.statusCode === 401 || res.data.code === "401") {
          console.error('提交访客申请失败，权限错误:', res.data);
          reject({
            code: 401,
            message: '登录已过期，请重新登录'
          });
        } else {
          console.error('提交访客申请失败，其他错误:', res.data);
          reject({
            code: res.data.code,
            message: res.data.msg || '提交访客申请失败'
          });
        }
      },
      fail: (err) => {
        console.error('提交访客申请请求失败:', err);
        reject({
          code: -1,
          message: '网络连接失败'
        });
      }
    });
  });
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
  generateGuestQRCode
};