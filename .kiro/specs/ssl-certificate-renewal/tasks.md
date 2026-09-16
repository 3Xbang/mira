# SSL证书续期任务清单

## 概述

基于AWS EC2实例的SSL证书续期操作，使用Let's Encrypt + Certbot方案解决miraa.homes的SSL证书过期问题（NET::ERR_CERT_DATE_INVALID）。

## 执行前准备

### 环境信息确认
- **域名**: miraa.homes
- **服务器**: AWS EC2实例 (miraa)
- **密钥对**: miraa.pem
- **安全组**: sg-097219ba9da4f7fee
- **操作系统**: Amazon Linux
- **Web服务器**: Nginx

## 任务执行清单

### 1. SSH连接准备
- [ ] 1.1 定位SSH密钥文件
  - **您的密钥文件位置**: `C:\Users\ASUS\Desktop\工程报价单\miyao\miraa.pem`
  - 打开PowerShell或Command Prompt
  - 切换到密钥文件目录：`cd "C:\Users\ASUS\Desktop\工程报价单\miyao"`

- [ ] 1.2 测试SSH连接
  - **连接命令**: `ssh -i miraa.pem ec2-user@miraa.homes`
  - 如果提示权限问题，在Windows下通常不需要chmod，直接尝试连接
  - 验证能够成功登录到服务器
  - 确认具有sudo权限

### 2. 服务器环境检查
- [ ] 2.1 检查当前SSL证书状态
  ```bash
  # 查看证书详细信息
  sudo certbot certificates
  
  # 检查证书过期时间
  sudo openssl x509 -in /etc/letsencrypt/live/miraa.homes/fullchain.pem -text -noout | grep "Not After"
  ```

- [ ] 2.2 检查Web服务器状态
  ```bash
  # 检查Nginx状态
  sudo systemctl status nginx
  
  # 测试Nginx配置
  sudo nginx -t
  ```

- [ ] 2.3 验证域名解析
  ```bash
  # 检查域名解析
  nslookup miraa.homes
  nslookup www.miraa.homes
  ```

### 3. SSL证书续期操作
- [ ] 3.1 备份当前配置（安全措施）
  ```bash
  # 备份SSL证书
  sudo cp -r /etc/letsencrypt/live/miraa.homes /tmp/ssl-backup-$(date +%Y%m%d)
  
  # 备份Nginx配置
  sudo cp /etc/nginx/nginx.conf /tmp/nginx-backup-$(date +%Y%m%d).conf
  ```

- [ ] 3.2 执行证书续期
  ```bash
  # 方法1：自动续期（推荐）
  sudo certbot renew --nginx
  
  # 如果失败，使用方法2：手动指定域名
  sudo certbot --nginx -d miraa.homes -d www.miraa.homes
  ```

- [ ] 3.3 验证续期结果
  ```bash
  # 检查续期后的证书信息
  sudo certbot certificates
  
  # 查看续期日志
  sudo tail -f /var/log/letsencrypt/letsencrypt.log
  ```

### 4. Web服务器配置更新
- [ ] 4.1 重新加载Nginx配置
  ```bash
  # 测试配置语法
  sudo nginx -t
  
  # 重新加载配置
  sudo systemctl reload nginx
  
  # 检查服务状态
  sudo systemctl status nginx
  ```

- [ ] 4.2 重启相关服务（如需要）
  ```bash
  # 如果有Node.js应用，重启PM2
  pm2 restart all
  
  # 检查PM2状态
  pm2 status
  ```

### 5. 验证和测试
- [ ] 5.1 本地SSL测试
  ```bash
  # 测试SSL连接
  openssl s_client -connect miraa.homes:443 -servername miraa.homes
  
  # 检查新证书有效期
  echo | openssl s_client -servername miraa.homes -connect miraa.homes:443 2>/dev/null | openssl x509 -noout -dates
  ```

- [ ] 5.2 浏览器访问测试
  - 打开浏览器访问 https://miraa.homes
  - 验证无SSL错误提示
  - 检查证书详细信息（点击地址栏锁图标）
  - 确认证书有效期已更新

- [ ] 5.3 外部SSL测试（可选）
  - 使用SSL Labs测试：https://www.ssllabs.com/ssltest/
  - 输入域名：miraa.homes
  - 验证获得A级评分

### 6. 自动续期配置
- [ ] 6.1 检查定时任务
  ```bash
  # 查看当前crontab
  sudo crontab -l
  
  # 检查certbot定时任务是否存在
  ls -la /etc/cron.d/certbot
  ```

- [ ] 6.2 配置自动续期（如果不存在）
  ```bash
  # 添加定时任务
  sudo crontab -e
  # 添加以下行（每天2:30 AM检查续期）：
  # 30 2 * * * /usr/bin/certbot renew --quiet && /bin/systemctl reload nginx
  ```

- [ ] 6.3 测试自动续期
  ```bash
  # 模拟续期测试
  sudo certbot renew --dry-run
  ```

## 故障排除

### 常见问题及解决方案

#### 问题1：SSH连接失败
**错误**: Permission denied (publickey)
**解决方案**:
```bash
# 检查密钥文件权限
chmod 400 miraa.pem

# 使用正确的用户名和密钥文件
ssh -i miraa.pem ec2-user@miraa.homes
```

#### 问题2：Certbot续期失败
**错误**: Failed authorization procedure
**解决方案**:
```bash
# 检查80端口是否开放
sudo netstat -tlnp | grep :80

# 检查防火墙设置
sudo iptables -L

# 临时停止Web服务器进行续期
sudo systemctl stop nginx
sudo certbot renew
sudo systemctl start nginx
```

#### 问题3：Nginx配置错误
**错误**: nginx: configuration file syntax is invalid
**解决方案**:
```bash
# 恢复备份配置
sudo cp /tmp/nginx-backup-*.conf /etc/nginx/nginx.conf

# 重新测试配置
sudo nginx -t

# 重新加载
sudo systemctl reload nginx
```

## 验收标准

### ✅ 成功标准
- [ ] SSL证书有效期显示为新的90天
- [ ] 浏览器访问miraa.homes无SSL错误
- [ ] 网站所有功能正常
- [ ] HTTPS强制跳转工作正常
- [ ] 自动续期定时任务配置完成

### 📝 完成确认
操作完成后，请确认：
1. 证书续期成功，新的有效期约90天
2. 网站https://miraa.homes正常访问
3. 浏览器地址栏显示安全锁图标
4. 所有页面和功能正常工作
5. 自动续期任务配置完成

## 注意事项

1. **操作时机**: 建议在网站流量较低时进行操作
2. **备份重要**: 操作前务必备份当前配置
3. **分步验证**: 每完成一个步骤都要进行验证
4. **日志监控**: 关注操作过程中的错误日志
5. **应急方案**: 如遇问题可先恢复备份确保网站可访问