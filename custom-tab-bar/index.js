Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#1989fa",
    list: []
  },
  
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      this.setData({
        list: [{
          pagePath: "/pages/index/index",
          iconPath: "/images/home.png",
          selectedIconPath: "/images/home_active.png",
          text: "首页"
        }, {
          pagePath: "/pages/community/community",
          iconPath: "/images/community.png",
          selectedIconPath: "/images/community_active.png",
          text: "社区"
        }, {
          pagePath: "/pages/door/door",
          iconPath: "/images/door.png",
          selectedIconPath: "/images/door_active.png",
          text: "开门"
        }, {
          pagePath: "/pages/message/message",
          iconPath: "/images/message.png",
          selectedIconPath: "/images/message_active.png",
          text: "信息"
        }, {
          pagePath: "/pages/my/my",
          iconPath: "/images/my.png",
          selectedIconPath: "/images/my_active.png",
          text: "我的"
        }]
      });
    }
  },
  
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({
        url
      });
      this.setData({
        selected: data.index
      });
    }
  }
}) 