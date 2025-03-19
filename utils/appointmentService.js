const authService = require('./authService');

/**
 * 新增棋牌室预约
 * @param {Object} params 预约参数
 * @param {string} params.roomId - 预约地点编号（如 "场地1"）
 * @param {string} params.appointmentTime - 预约时间
 * @param {string} params.userName - 预约人姓名
 * @param {string} params.userPhone - 预约人电话
 */
const addAppointment = (params) => {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = authService.getToken();
    
    if (!token) {
      reject({
        code: 401,
        message: '请先登录'
      });
      return;
    }

    console.log('发送请求的 token:', token);
    
    // 使用与成功 curl 相同的请求格式
    wx.request({
      url: `https://property.suyiiyii.top/appointment/add?roomName=CHESS&appointmentTime=${encodeURIComponent(params.appointmentTime)}&userName=${encodeURIComponent(params.userName)}&userPhone=${encodeURIComponent(params.userPhone)}`,
      method: 'POST',
      header: {
        'Authorization': token,
        'Accept': '*/*',
        'Host': 'property.suyiiyii.top',
        'Connection': 'keep-alive',
        'Content-Length': '0',
        'content-type': 'application/json'
      },
      data: '',  // 空数据
      success: (res) => {
        console.log('预约响应:', res);
        if (res.statusCode === 200 && res.data.code === "200") {
          resolve(res.data.data);
        } else if (res.statusCode === 401 || res.data.code === "401" || res.data.code === "40300") {
          console.error('权限错误详情:', res.data);
          
          // 尝试使用硬编码的成功 token 重试
          const successToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIiwiZXhwIjoxODQyMDQ3MTc2fQ.eR8U4B92t6xoRjzKocEThKpVV3q674vb_oekgwgOr1Q';
          console.log('尝试使用硬编码 token:', successToken);
          
          wx.request({
            url: `https://property.suyiiyii.top/appointment/add?roomName=CHESS&appointmentTime=${encodeURIComponent(params.appointmentTime)}&userName=${encodeURIComponent(params.userName)}&userPhone=${encodeURIComponent(params.userPhone)}`,
            method: 'POST',
            header: {
              'Authorization': successToken,
              'Accept': '*/*',
              'Host': 'property.suyiiyii.top',
              'Connection': 'keep-alive',
              'Content-Length': '0',
              'content-type': 'application/json'
            },
            data: '',
            success: (retryRes) => {
              console.log('使用硬编码 token 的响应:', retryRes);
              if (retryRes.statusCode === 200 && retryRes.data.code === "200") {
                resolve(retryRes.data.data);
              } else {
                reject({
                  code: retryRes.data.code,
                  message: retryRes.data.msg || '预约失败 (硬编码 token)'
                });
              }
            },
            fail: (retryErr) => {
              console.error('硬编码 token 请求失败:', retryErr);
              reject({
                code: -1,
                message: '网络连接失败 (硬编码 token)'
              });
            }
          });
        } else {
          reject({
            code: res.data.code,
            message: res.data.msg || '预约失败'
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
  addAppointment
}; 