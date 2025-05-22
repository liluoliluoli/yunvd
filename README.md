# YunVD

hls视频播放，支持android tv

## 🚀 How to use

#### 环境配置

- android
  studio导入后，修改gradle
  jdk：![375464723-3013bdd8-8bc0-47bc-a02a-696a891a12c5.png](../../../Library/Group%20Containers/group.com.apple.notes/Accounts/A1850EBF-3AE8-4C87-80A6-F175D6BBD179/Media/4FA59660-71D1-4AAC-B88C-A7B73B671476/1_01C355C7-383F-4540-9470-1309B2A3099C/375464723-3013bdd8-8bc0-47bc-a02a-696a891a12c5.png)
- 替换node-modules中的1.9.24为2.1.0

#### 打包apk

- cd android
- ./gradlew assembleRelease

#### 真实设备调试

- 开启开发者模式，打开usb调试
- adb disconnect 192.168.0.108:5555
