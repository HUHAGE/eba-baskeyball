const fs = require('fs')
const path = require('path')

// 复制文件到 uTools 开发目录
const copyToUTools = () => {
  const distPath = path.resolve(__dirname, '../dist')
  const utoolsDevPath = process.env.UTOOLS_DEV_PATH || path.resolve(__dirname, '../utools-dev')

  // 确保目标目录存在
  if (!fs.existsSync(utoolsDevPath)) {
    fs.mkdirSync(utoolsDevPath, { recursive: true })
  }

  // 复制构建文件
  fs.cpSync(distPath, utoolsDevPath, { recursive: true })

  // 复制插件配置文件
  fs.copyFileSync(
    path.resolve(__dirname, '../plugin.json'),
    path.join(utoolsDevPath, 'plugin.json')
  )

  // 复制预加载脚本
  fs.copyFileSync(
    path.resolve(__dirname, '../preload.js'),
    path.join(utoolsDevPath, 'preload.js')
  )

  // 复制 logo
  if (fs.existsSync(path.resolve(__dirname, '../public/logo.png'))) {
    fs.copyFileSync(
      path.resolve(__dirname, '../public/logo.png'),
      path.join(utoolsDevPath, 'logo.png')
    )
  }

  console.log('Files copied to uTools development directory successfully!')
}

copyToUTools() 