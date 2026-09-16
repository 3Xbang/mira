# SSL证书续期技术设计

## 设计概述

本设计方案提供了完整的SSL证书续期流程，确保miraa.homes网站的HTTPS服务正常运行。采用Let's Encrypt + Certbot的标准解决方案，通过自动化操作最小化服务中断。

## 系统架构

### 当前环境架构
```
AWS EC2 (mira instance)
├── Amazon Linux OS
├── Nginx Web Server
├── Let's Encrypt Certificate
├── Certbot (证书管理工具)
└── PM2 (Node.js应用管理)
```

### SSL证书管理流程
```
1. SSH连接到EC2服务器
2. 检查当前证书状态
3. 运行Certbot续期命令
4. 重新加载Nginx配置
5. 验证新证书生效
```

## 详细设计

### D1: 服务器连接设计

#### D1.1 SSH密钥识别
- **目标**: 确定正确的SSH密钥对文件
- **方法**: 
  - 检查AWS EC2控制台中实例的密钥对名称
  - 查找本地对应的.pem文件
  - 验证密钥文件权限（400）

#### D1.2 服务器访问验证
- **连接命令**: `ssh -i /path/to/key.pem ec2-user@miraa.homes`
- **验证点**: 
  - SSH连接成功
  - 具有sudo权限
  - 可以访问Nginx和Certbot

### D2: 证书状态检查设计

#### D2.1 当前证书信息检查
```bash
# 检查SSL证书详细信息
sudo openssl x509 -in /etc/letsencrypt/live/miraa.homes/fullchain.pem -text -noout

# 检查证书过期时间
sudo certbot certificates

# 检查Nginx SSL配置
sudo nginx -t
```

#### D2.2 域名解析验证
```bash
# 验证域名解析到正确IP
nslookup miraa.homes
nslookup www.miraa.homes

# 检查当前网站状态
curl -I https://miraa.homes
```

### D3: 证书续期操作设计

#### D3.1 Certbot续期命令设计
```bash
# 方法1：自动续期所有证书
sudo certbot renew --nginx

# 方法2：针对特定域名续期
sudo certbot --nginx -d miraa.homes -d www.miraa.homes

# 方法3：测试续期（不实际更新）
sudo certbot renew --dry-run
```

#### D3.2 续期过程监控
- **日志位置**: `/var/log/letsencrypt/letsencrypt.log`
- **状态检查**: 命令执行返回码
- **错误处理**: 常见错误的解决方案

### D4: Web服务器配置设计

#### D4.1 Nginx配置验证
```bash
# 测试Nginx配置语法
sudo nginx -t

# 重新加载Nginx配置
sudo systemctl reload nginx

# 检查Nginx服务状态
sudo systemctl status nginx
```

#### D4.2 SSL配置优化
- **SSL协议版本**: TLSv1.2和TLSv1.3
- **加密套件**: 现代浏览器兼容的安全套件
- **HSTS配置**: 强制HTTPS访问

### D5: 验证和测试设计

#### D5.1 本地验证测试
```bash
# 测试SSL证书链
openssl s_client -connect miraa.homes:443 -servername miraa.homes

# 检查证书有效期
echo | openssl s_client -servername miraa.homes -connect miraa.homes:443 2>/dev/null | openssl x509 -noout -dates
```

#### D5.2 外部验证测试
- **浏览器测试**: Chrome、Firefox、Safari访问测试
- **SSL Labs测试**: https://www.ssllabs.com/ssltest/
- **移动设备测试**: 验证移动浏览器兼容性

### D6: 自动化配置设计

#### D6.1 自动续期定时任务
```bash
# 检查现有crontab任务
sudo crontab -l

# 添加自动续期任务（如果不存在）
# 每天2:30 AM运行续期检查
30 2 * * * /usr/bin/certbot renew --quiet && /bin/systemctl reload nginx
```

#### D6.2 监控和告警配置
- **证书到期提醒**: 30天、7天、1天到期提醒
- **续期失败告警**: 邮件或短信通知
- **服务可用性监控**: 网站访问状态监控

## 错误处理设计

### E1: 常见错误及解决方案

#### E1.1 权限问题
- **错误**: Permission denied
- **解决**: 确保使用sudo权限，检查文件所有权

#### E1.2 域名验证失败
- **错误**: Failed authorization procedure
- **解决**: 检查DNS解析，确保防火墙开放80/443端口

#### E1.3 Nginx配置冲突
- **错误**: nginx: configuration file syntax is invalid
- **解决**: 备份配置文件，恢复到正常状态

### E2: 回滚方案
- **备份**: 操作前备份当前证书和Nginx配置
- **回滚**: 如果新证书有问题，恢复备份文件
- **应急**: 临时禁用SSL重定向，确保网站可访问

## 安全考虑

### S1: 访问安全
- **SSH密钥管理**: 使用强密钥，定期轮换
- **权限控制**: 最小权限原则，不使用root用户
- **网络安全**: VPC安全组配置，限制访问源

### S2: 证书安全
- **私钥保护**: 确保私钥文件权限正确（600）
- **证书透明度**: 监控CT日志，防止恶意证书
- **定期更新**: 遵循90天续期周期

## 性能优化

### P1: 续期过程优化
- **时间选择**: 选择低流量时间进行续期
- **并发处理**: 避免与其他维护任务冲突
- **缓存预热**: 续期后预热SSL会话缓存

### P2: SSL性能优化
- **OCSP Stapling**: 启用OCSP装订提升握手速度
- **Session复用**: 配置SSL会话缓存
- **HTTP/2支持**: 确保现代协议支持