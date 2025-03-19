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
    const token = authService.getToken();
    
    if (!token) {
      reject(new Error('未登录'));
      return;
    }

    // 构建请求URL，注意参数编码
    const url = `https://property.suyiiyii.top/appointment/add?roomName=CHESS&appointmentTime=${encodeURIComponent(params.appointmentTime)}&userName=${encodeURIComponent(params.userName)}&userPhone=${encodeURIComponent(params.userPhone)}`;

    wx.request({
      url: url,
      method: 'POST',
      header: {
        'Authorization': token,
        'Accept': '*/*',
        'Host': 'property.suyiiyii.top',
        'Connection': 'keep-alive'
      },
      success: (res) => {
        console.log('预约响应:', res);
        if (res.statusCode === 200 && res.data.code === "200") {
          resolve(res.data.data);
        } else if (res.statusCode === 401 || res.data.code === "401") {
          reject({
            code: 401,
            message: '登录已过期，请重新登录'
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