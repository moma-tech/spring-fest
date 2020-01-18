// pages/getGreeting/getGreeting.js

const app = getApp()

Page({

  data: {
    step: 1,
    openid: '',
    count: null,
    queryResult: '',
  },

  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
  },


  onQuery: function () {
    const db = wx.cloud.database()
    var id = [];
    var total = 100
    db.collection('greeting')
      .count({
        success: function(ress){
          total=ress.total
          console.log(ress.total)
        }
    })
    // 查询当前用户所有的 counters
    for(var i=0;i<5;i++){
      id[i] = parseInt(Math.random() * total);
    }
    console.log(id)
    db.collection('greeting').where({
      _id: db.command.in(id)
    }).field({
      content:true,
    }).get({
      success: res => {
        this.setData({
          queryResult: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  copyBtn: function (e) {
    console.log(e.currentTarget.dataset.gid)
    wx.setClipboardData({
      //去找上面的数据
      data: e.currentTarget.dataset.gid,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },
  nextStep: function () {
    // 在第一步，需检查是否有 openid，如无需获取
    if (this.data.step === 1 && !this.data.openid) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          app.globalData.openid = res.result.openid
          this.setData({
            step: 2,
            openid: res.result.openid
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 openid 失败，请检查是否有部署 login 云函数',
          })
          console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
        }
      })
    } else {
      const callback = this.data.step !== 6 ? function () { } : function () {
        console.group('数据库文档')
        console.log('https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html')
        console.groupEnd()
      }

      this.setData({
        step: this.data.step + 1
      }, callback)
    }
  },

  prevStep: function () {
    this.setData({
      step: this.data.step - 1
    })
  },

  goHome: function () {
    const pages = getCurrentPages()
    if (pages.length === 2) {
      wx.navigateBack()
    } else if (pages.length === 1) {
      wx.redirectTo({
        url: '../index/index',
      })
    } else {
      wx.reLaunch({
        url: '../index/index',
      })
    }
  }

})