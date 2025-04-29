const authService = require('./authService');

/**
 * 获取所有可预约房间
 * @returns {Promise} 包含所有房间信息的Promise
 */
const getAllRooms = () => {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = wx.getStorageSync('token');
    
    if (!token) {
      reject({
        code: 401,
        message: '请先登录'
      });
      return;
    }
    
    // 确保token格式正确
    let formattedToken = token;
    if (token && !token.startsWith('Bearer ')) {
      formattedToken = `Bearer ${token}`;
    }
    
    console.log('获取房间列表的token:', formattedToken);
    
    // 获取已选择的小区信息
    const selectedCommunity = wx.getStorageSync('selectedCommunity');
    const communityId = selectedCommunity?.id || '1';
    
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/appointment/getAllRoom',
      method: 'GET',
      header: {
        'Authorization': formattedToken,
        'communityId': communityId,
        'Accept': '*/*',
        'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
        'Connection': 'keep-alive'
      },
      success: (res) => {
        console.log('获取房间列表响应:', res);
        if (res.statusCode === 200 && res.data && res.data.code === "200") {
          resolve(res.data.data || []);
        } else {
          reject({
            code: res.data?.code || res.statusCode,
            message: res.data?.msg || '获取房间列表失败'
          });
        }
      },
      fail: (err) => {
        console.error('获取房间列表请求失败:', err);
        reject({
          code: -1,
          message: '网络连接失败'
        });
      }
    });
  });
};

/**
 * 新增棋牌室预约
 * @param {Object} params 预约参数
 * @param {string} params.roomId - 预约地点编号
 * @param {string} params.appointmentTime - 预约时间
 * @param {string} params.userName - 预约人姓名
 * @param {string} params.userPhone - 预约人电话
 */
const addAppointment = (params) => {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = wx.getStorageSync('token');
    
    if (!token) {
      reject({
        code: 401,
        message: '请先登录'
      });
      return;
    }

    // 确保token格式正确
    let formattedToken = token;
    if (token && !token.startsWith('Bearer ')) {
      formattedToken = `Bearer ${token}`;
    }
    
    console.log('预约请求的 token:', formattedToken);
    
    // 获取已选择的小区信息
    const selectedCommunity = wx.getStorageSync('selectedCommunity');
    const communityId = selectedCommunity?.id || '1';
    
    // 构建请求URL
    const url = 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/appointment/add';
    
    // 构建请求数据
    const data = {
      roomId: params.roomId,
      appointmentTime: params.appointmentTime,
      userName: params.userName,
      userPhone: params.userPhone
    };
    
    console.log('预约请求数据:', data);
    
    // 使用与成功 curl 相同的请求格式
    wx.request({
      url: url,
      method: 'POST',
      header: {
        'Authorization': formattedToken,
        'Accept': '*/*',
        'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
        'Connection': 'keep-alive',
        'communityId': communityId,
        'content-type': 'application/json'
      },
      data: data,
      success: (res) => {
        console.log('预约响应:', res);
        if (res.statusCode === 200 && res.data && res.data.code === "200") {
          resolve(res.data.data);
        } else if (res.statusCode === 401 || res.data.code === "401" || res.data.code === "40300") {
          console.error('权限错误详情:', res.data);
          reject({
            code: 401,
            message: res.data?.msg || '登录已过期，请重新登录'
          });
        } else {
          reject({
            code: res.data?.code || res.statusCode,
            message: res.data?.msg || '预约失败'
          });
        }
      },
      fail: (err) => {
        console.error('预约请求失败:', err);
        reject({
          code: -1,
          message: '网络连接失败'
        });
      }
    });
  });
};

module.exports = {
  addAppointment,
  getAllRooms
}; 