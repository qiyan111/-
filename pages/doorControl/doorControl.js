Page({
  data: {
    cameras: [
      { id: 1, location: '地点1', time: 'YYYY-MM-DD HH:MM:SS' },
      { id: 2, location: '地点2', time: 'YYYY-MM-DD HH:MM:SS' },
      { id: 3, location: '地点3', time: 'YYYY-MM-DD HH:MM:SS' }
    ]
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 打开门
  openDoor() {
    wx.showToast({
      title: '正在开门...',
      icon: 'loading',
      duration: 2000
    });
    
    // 模拟开门操作
    setTimeout(() => {
      wx.showToast({
        title: '开门成功',
        icon: 'success',
        duration: 1500
      });
    }, 2000);
  },

  // 关门
  closeDoor() {
    wx.showToast({
      title: '正在关门...',
      icon: 'loading',
      duration: 2000
    });
    
    // 模拟关门操作
    setTimeout(() => {
      wx.showToast({
        title: '关门成功',
        icon: 'success',
        duration: 1500
      });
    }, 2000);
  },

  // 播放监控
  playCamera(e) {
    const cameraId = e.currentTarget.dataset.id;
    wx.showToast({
      title: `正在连接摄像头${cameraId}...`,
      icon: 'none'
    });
  },

  // 全屏查看
  fullScreen(e) {
    const cameraId = e.currentTarget.dataset.id;
    wx.showToast({
      title: `全屏查看功能开发中`,
      icon: 'none'
    });
  }
}) 