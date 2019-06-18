import './style.scss';
import axios from 'axios'

var Axios = axios.create({
  baseURL: 'http://47.110.150.249:8899',
  timeout: 2000,
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  transformRequest: function(data) {
    var bodyFormData = new FormData();
    for(var key in data){
      bodyFormData.set(key, data[key]);
    }
    return bodyFormData
  }
});

var apiRequest = {
  getPageInfo: function() {
    return Axios({
      method: 'get',
      url: '/user/location-info'
    })
  },
  upLocation: function(param) {
    return Axios({
      method: 'post',
      url: '/user/location-h5-up',
      data: {
        user_id: param.userId,
        poisition: param.poisition,
        app_market: getUrlParamByName('appMarket') || 'h5-special',
        client_info: JSON.stringify({
          clientType: getPlatform().platform,
          deviceName: '',
          osVersion: '',
          appVersion: '',
          appMarket: getUrlParamByName('appMarket') || 'h5-special',
          deviceId: ''
        }),
      }
    })
  },
  download: function(param) {
    return Axios({
      method: 'post',
      url: '/main/download-up',
      data: {
        user_id: param.userId,
        client_info: JSON.stringify({
          clientType: getPlatform().platform,
          deviceName: '',
          osVersion: '',
          appVersion: '',
          appMarket: getUrlParamByName('appMarket') || 'h5-special',
          deviceId: ''
        }),
      }
    })
  }
}

function getPlatform() {
  var u = navigator.userAgent;
  return {
    IOS: u.indexOf('iPhone') > -1,
    Android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
    WeiXin: u.match(/MicroMessenger/i) == 'micromessenger',
    platform: u.indexOf('iPhone') > -1 ? 'ios' : 'android'
  }
}

function getUrlParamByName(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  var r = decodeURI(window.location.search).substr(1).match(reg)
  if (r != null) return unescape(r[2])
  return null
}

function getPageInfo() {
  apiRequest.getPageInfo().then(function(res){
    var resp = res.data.data
    var logo = resp.logo
    var name = resp.name
    logo && document.querySelector('.logo-wrap .logo').setAttribute('src', logo)
    if (name) document.querySelector('.logo-wrap .title').innerHTML = name
    __DOWNLOAD__INIT__DATA__.androidDownUrl = resp.android_downurl
    __DOWNLOAD__INIT__DATA__.iosDownUrl = resp.ios_downurl
  })
}

var __DOWNLOAD__INIT__DATA__ = {
  androidDownUrl: null,
  iosDownUrl: null
}

document.querySelector('.download-btn img').addEventListener('click', function(){
  apiRequest.download({ userId: getUrlParamByName('uid') || 0, })
  apiRequest.upLocation({ userId: getUrlParamByName('uid') || 0, poisition: 3 })
  if (getPlatform().IOS && __DOWNLOAD__INIT__DATA__.iosDownUrl) {
    window.open(__DOWNLOAD__INIT__DATA__.iosDownUrl)
  }
  if (getPlatform().Android && __DOWNLOAD__INIT__DATA__.androidDownUrl) {
    window.open(__DOWNLOAD__INIT__DATA__.androidDownUrl)
  }
})

function init() {
  window.onload = function(){
    if (!getPlatform().IOS) {
      document.querySelector('.ios-download-container').style.cssText = 'display: none;'
    }
    if (!getUrlParamByName('uid')) {
      window.location.replace('/login.html')
    }
    getPageInfo()
  }
}
init()