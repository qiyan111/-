/**
 * 停车场服务
 * 封装与停车场相关的所有接口请求
 */

// 引入认证服务
const authService = require('./authService');

/**
 * 获取停车场信息（总车位数和空闲数）
 * @param {String} communityId - 社区ID，默认为1
 * @returns {Promise} 包含停车场信息的Promise
 */
const getParkingInfo = async (communityId = '1') => {
  try {
    console.log('=== 开始获取停车场信息 ===');
    const token = authService.getToken();
    
    if (!token) {
      console.error('未获取到token，无法获取停车场信息');
      throw new Error('请先登录');
    }
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/parking/get',
        method: 'GET',
        header: {
          'Authorization': token,
          'Accept': '*/*',
          'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
          'Connection': 'keep-alive',
          'communityId': communityId
        },
        success: (res) => {
          console.log('获取停车场信息响应:', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('获取停车场信息失败:', err);
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
      throw new Error('获取停车场信息失败，服务器错误');
    }
    
    const data = response.data;
    console.log('停车场信息响应数据:', data);
    
    if (data.code === "200") {
      return {
        totalCount: data.data.spaceNum || 0,
        availableCount: data.data.freeNum || 0
      };
    } else {
      throw new Error(data.message || '获取停车场信息失败');
    }
  } catch (error) {
    console.error('获取停车场信息失败:', error);
    throw error;
  }
};

module.exports = {
  getParkingInfo
}; 