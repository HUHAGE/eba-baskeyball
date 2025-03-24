// 定义一组柔和的现代色彩
const colors = [
  'F3D6E4', // 柔和粉
  'D4E5F9', // 淡蓝
  'D8F3DC', // 薄荷绿
  'FFF1D0', // 奶油黄
  'E5E1F1', // 淡紫
  'FFE5D9', // 蜜桃色
  'DCF2F1', // 清新蓝绿
  'F7E6D4', // 暖杏色
  'E9ECF5', // 淡灰蓝
  'F0F4E3'  // 嫩柠檬
]

export const generateAvatar = (name: string, size: number = 96) => {
  // 根据名字选择固定的颜色，这样同一个人总是用同一个颜色
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const backgroundColor = colors[colorIndex]
  
  // 使用较深的文字颜色以确保可读性
  const textColor = '555555'
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${backgroundColor}&color=${textColor}&size=${size}&bold=true`
} 