const authService = require('../../utils/authService.js'); // 引入认证服务

Page({
  data: {
    selectedCommunity: null,
    communities: [], 
    isLoading: true  // 初始状态为 true
  },
  
  onLoad: function() {
    console.log('选择小区页面加载');
    // 检查是否已登录，如果未登录，理论上 app.js 会处理跳转，但可以加一层保险
    if (!authService.checkLoginStatus()) {
      console.warn('selectCommunity: 未登录，跳转到 welcome');
      wx.reLaunch({ url: '/pages/welcome/welcome' });
      return; // 阻止后续执行
    }
    this.fetchCommunities(); 
  },
  
  fetchCommunities: function() {
    const that = this; 
    that.setData({
      isLoading: true // 每次请求前设置为 true
    });
    
    const authHeader = authService.getAuthHeader(); // 获取包含 Token 的请求头
    console.log('selectCommunity: 获取到的认证头:', authHeader);

    // 检查 token 是否存在，虽然 getAuthHeader 会处理，但明确检查更好
    if (!authHeader.Authorization) {
        console.error('selectCommunity: Token 不存在，无法获取小区列表');
        wx.showToast({ title: '登录状态失效，请重试', icon: 'none' });
        that.setData({ isLoading: false });
        // 可以选择跳转回登录页
        // wx.reLaunch({ url: '/pages/welcome/welcome' }); 
        return;
    }

    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/community/selectAllCommunity',
      method: 'GET',
      header: authHeader, // 使用从 authService 获取的 header
      success: function(res) {
        let communitiesData = [];
        let defaultSelection = null;
        if (res.statusCode === 200 && res.data && res.data.code === "200" && Array.isArray(res.data.data)) {
          communitiesData = res.data.data.map(item => ({ // 确保数据结构一致
             id: item.id, 
             name: item.communityName, // 假设接口返回的是 communityName
             address: item.communityAddress // 假设接口返回的是 communityAddress
           }));
          defaultSelection = communitiesData.length > 0 ? communitiesData[0] : null;
          
        } else {
           console.error('获取小区列表失败:', res);
           // 可以选择性地显示提示
        }
        that.setData({
          communities: communitiesData,
          selectedCommunity: defaultSelection,
          isLoading: false // 请求结束（无论成功失败）都设置为 false
        });
      },
      fail: function(err) {
        console.error('请求小区列表接口失败:', err);
        // 网络错误等情况
         that.setData({
          communities: [], // 清空数据
          selectedCommunity: null,
          isLoading: false // 请求结束设置为 false
        });
         wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
      }
    });
  },

  selectCommunity: function(e) {
    const id = e.currentTarget.dataset.id; // 获取小区 ID
    const community = this.data.communities.find(item => item.id === id);
    
    if (community) {
      this.setData({
        selectedCommunity: community
      });
    }
  },

  confirmSelection: function() {
    if (!this.data.selectedCommunity) {
      wx.showToast({
        title: '请选择小区',
        icon: 'none'
      });
      return;
    }
    
    console.log('confirmSelection: 选择了小区', this.data.selectedCommunity);
    // 保存选择的小区信息
    wx.setStorageSync('selectedCommunity', this.data.selectedCommunity);
    
    // 跳转到首页 (假设首页是 TabBar 页面)
    console.log('confirmSelection: 跳转到 index');
    wx.switchTab({
      url: '/pages/index/index', // 确认首页路径
      success: () => {
        console.log('成功跳转到首页');
      },
      fail: (error) => {
        console.error('跳转到首页失败:', error);
        // 如果跳转失败，可能是路径错误或非 TabBar 页面用了 switchTab
        wx.showToast({
          title: '跳转主页失败',
          icon: 'none'
        });
      }
    });
  }
})
