# Nginx

文档参考地址：<https://juejin.cn/post/7026150640560635918>

## 概述

Nginx 是由俄罗斯人 Igor Sysoev 设计开发的，开发工作从 2002 年开始，第一次公开发布在 2004 年 10 月 4 日。官方网站为：<http://nginx.org/>。它是一款免费开源的高性能 HTTP 代理服务器及反向代理服务器（Reverse Proxy）产品，同时它还可以提供 IMAP/POP3 邮件代理服务等功能。它高并发性能很好，官方测试能够支撑 5 万的并发量；运行时内存和 CPU 占用率低，配置简单，容易上手，而且运行非常稳定。

## 常用功能

- **反向代理**
  
  这是 Nginx 服务器作为 WEB 服务器的主要功能之一，客户端向服务器发送请求时，会首先经过 Nginx 服务器，由服务器将请求分发到相应的 WEB 服务器。正向代理是代理客户端，而反向代理则是代理服务器，Nginx 在提供反向代理服务方面，通过使用正则表达式进行相关配置，采取不同的转发策略，配置相当灵活，而且在配置后端转发请求时，完全不用关心网络环境如何，可以指定任意的 IP 地址和端口号，或其他类型的连接、请求等。
- **负载均衡**
  
  这也是 Nginx 最常用的功能之一，负载均衡，一方面是将单一的重负载分担到多个网络节点上做并行处理，每个节点处理结束后将结果汇总返回给用户，这样可以大幅度提高网络系统的处理能力；另一方面将大量的前端并发请求或数据流量分担到多个后端网络节点分别处理，这样可以有效减少前端用户等待相应的时间。而 Nginx 负载均衡都是属于后一方面，主要是对大量前端访问或流量进行分流，已保证前端用户访问效率，并可以减少后端服务器处理压力。
- **Web 缓存**
  
  在很多优秀的网站中，Nginx 可以作为前置缓存服务器，它被用于缓存前端请求，从而提高 Web 服务器的性能。Nginx 会对用户已经访问过的内容在服务器本地建立副本，这样在一段时间内再次访问该数据，就不需要通过 Nginx 服务器向后端发出请求。减轻网络拥堵，减小数据传输延时，提高用户访问速度。

## Location 配置指令规则

Nginx 的配置文件使用的是一门微型的编程语言。既然是编程语言，一般也就少不了"变量"这种东西，但是在 Nginx 配置中，变量只能存放一种类型的值，那就是字符串。可以用 `set` 配置指令动态指定变量的值，Nginx 变量名前面有一个 `$` 符号，并且所有的 Nginx 变量在 Nginx 配置文件中引用时都必须带上 `$` 前缀。

### 文件结构（用主配置文件为例）

```
main        # Nginx 的全局配置，对全局生效
├── events  # 配置影响 nginx 服务器或与用户的网络连接
├── http    # 配置代理，缓存，日志定义等绝大多数功能和第三方模块的配置，可以嵌套多个 server
│   ├── upstream # 配置后端服务器具体地址，负载均衡配置不可或缺的部分
│   ├── server   # 配置虚拟主机的相关参数，如域名、IP、端口等，一个 http 块中可以有多个 server 块
│   │   ├── location  # 配置请求的路由，以及各种页面的处理情况
│   │   ├── location  # server 块可以包含多个 location 块，location 指令用于匹配 uri
│   │   └── ...
│   └── ...
└── ...
```

## Nginx 配置文件的语法规则

Nginx 是由一些模块组成，一般在配置文件中使用一些具体的指令来控制。指令被分为简单指令（简称指令）和块级指令（简称指令块）。

### 简单指令

简单指令是由名字和参数组成，中间用空格分开，并以分号结尾。

```nginx
root /data/www;
```

### 块级指令

块级指令跟简单指令有类似的结构，但是末尾不是分号而是用大括号（`{}`）包裹的额外指令集。如果一个块级指令的大括号中有其他指令，则它被叫做一个上下文（比如：`events`、`http`、`server` 和 `location`）。

在配置文件中，没有放在任何上下文中的指令都处在主上下文中。`events` 和 `http` 的指令是放在主上下文中，`server` 放在 `http` 中，`location` 放在 `server` 中。

```nginx
# 块级指令
http {
  server {
      listen 80;
      server_name doc.chenfangxu.com;
      access_log logs/doc.chenfangxu.access.log;
      root html;

      location ~ \.php$ {
          fastcgi_pass 127.0.0.1:1025;
      }
    }
  }
```

### 语法规则

- 配置文件由指令与指令块构成。
- 每条指令以分号 `;` 结尾，指令与参数间以空格符号分隔。
- 指令块以大括号 `{}` 将多条指令组织在一起。
- `include` 语句允许组合多个配置文件以提升可维护性。
- 通过 `#` 符号添加注释，提高可维护性。
- 通过 `$` 符号使用变量。
- 部分指令的参数支持正则表达式，例如常用的 `location` 指令。

## Location 指令块规则

`location` 指令用于仅匹配 uri，忽略参数，可以使用合法的字符串或者正则表达式。

`location` 块的主要作用是，基于 Nginx 服务器接收到的请求字符串（例如，`server_name/uri-string`），对除虚拟主机名称（也可以是 IP 别名，后文有详细阐述）之外的字符串（前例中"/uri-string"部分）进行匹配，对特定的请求进行处理。地址定向、数据缓存和应答控制等功能都是在这部分实现。许多第三方模块的配置也是在 `location` 块中提供功能。

在 nginx 的官方文档中定义的 `location` 的语法结构：

```
location [ = | ~ | ~* | ^~ | 空 ] uri { ... }
```

其中方括号里的部分，是可选项，用来改变请求字符串与 uri 的匹配方式。在介绍四种标识的含义之前，我们需要先了解不添加此选项时，Nginx 服务器是如何在 `server` 块中搜索并使用 `location` 块的 uri 和请求字符串匹配的。

在不添加此选项时，Nginx 服务器首先在 `server` 块的多个 `location` 块中搜索是否有标准 uri 和请求字符串匹配，如果有多个可以匹配，就记录匹配度最高的一个。然后，服务器再用 `location` 块中的正则 uri 和请求字符串匹配，当第一个正则 uri 匹配成功，结束搜索，并使用这个 `location` 块处理此请求；如果正则匹配全部失败，就使用刚才记录的匹配度最高的 `location` 块处理此请求。

### 四个标识的含义

- `=`：**精确匹配**，用于不含正则表达式的 uri 前，如果匹配成功，不再进行后续的查找。
- `^~`：**前缀匹配**，用于不含正则表达式的 uri 前，表示如果该符号后面的字符是最佳匹配。采用该规则，不再进行后续的正则查找。跟 `=` 的区别是，不需要 uri 一模一样，只需要开头和 uri 匹配即可。
- `~`：**正则匹配**，表示用该符号后面的正则 uri 去匹配路径，**区分大小写**。
- `~*`：**正则匹配**，表示用该符号后面的正则 uri 去匹配路径，**不区分大小写**。
- **空**：**普通匹配（最长字符匹配）**，匹配以 uri 开头的字符串，只能是普通字符串。例如，`location /` 是通用匹配，任何请求都会匹配到。另外普通匹配与 `location` 顺序无关，是按照匹配的长短来确定匹配结果。

> 我们知道，在浏览器传送 url 的时候会对一部分字符进行 url 编码，例如空格被编码为 `%20`，问号 `%3f` 等。而 `~` 会对 url 中的这些符号进行解码的处理，所以 url 正常书写即可。

> 在 `location` 块中的 `proxy_pass http://xxx.xxx.xxx:8080` 中，如果 8080 后面带了 `/` 则会使用 `/` 来替换掉被拦截的 uri。

### 访问控制 allow / deny

Nginx 的访问控制模块默认就会安装，而且写法简单，可以分别有多个 `allow/deny`，允许或禁止某个 ip 或 ip 段访问，依次满足任何一个规则就停止往下匹配。

例子：

```nginx
location /nginx-status {
  allow 192.168.10.100;
  allow 172.29.73.0/24;
  deny all;
}
```

### Location 匹配的优先级

```
location = uri > location uri（即使已经匹配到了，也还是会去匹配正则）> location ^~ uri > location ~/~* 正则 url > location 部分起始路径 > location /
```

即：**精确匹配 > 最长字符串匹配（完全匹配，还会去匹配正则）> 前缀匹配 > 正则匹配 > 普通匹配（最长字符串匹配，部分匹配）> 通用匹配**

- 在所有匹配成功的 uri 中，选取匹配度最长的 uri 字符地址。正则除外，正则匹配是按照先后顺序确定匹配结果。
- 正则匹配成功之后停止匹配，普通匹配成功后还会接着匹配正则。
- 如果 uri 包含正则表达式，则必须有 `~` 或 `~*` 标志，否则正则代码只能作为普通字符使用，例如 `location = /demo$`，其中的 `$` 并不代表正则模式结束，而是一个实实在在的 `$` 字符，是 url 的一部分。
- 针对 `~` 和 `~*` 匹配标识符，可以在前面加上 `!` 来取反：
  - `!~`：表示正则不匹配，区分大小写
  - `!~*`：表示正则不匹配，不区分大小写

### 根据优先级来模拟 Nginx location 的匹配过程

1. Nginx 首先根据 url 检查最长匹配前缀字符串，即会判断 `=`、`^~`、空修饰符定义的内容。
   - 如果匹配到最长匹配前缀字符串（即最长的 uri）。
   - 如果最长匹配前缀字符串被 `=` 修饰符匹配，则立即响应。
   - 如果没有被 `=` 修饰符匹配，则执行第 2 步判断。
2. Nginx 继续检查最长匹配前缀字符串，即判断 `^~`、空修饰符定义的内容。
   - 如果最长匹配前缀字符串被 `^~` 修饰符匹配，则立即响应。
   - 如果被空修饰符匹配，则将该匹配保存起来（不管是普通匹配的完全匹配还是部分匹配），并执行第 3 步判断。
3. Nginx 找到 nginx.conf 中定义的所有正则匹配（`~` 和 `~*`），并按顺序进行匹配。
   - 如果有任何正则表达式匹配成功，则立即响应。
   - 如果没有任何正则匹配成功，则响应第 2 步中存储的空修饰符匹配结果。

## yum 安装的 nginx 典型配置

```nginx
user  nginx;                        # 运行用户
worker_processes  1;                # Nginx 进程数，一般设置为同 CPU 核数一样
error_log  /var/log/nginx/error.log warn;   # Nginx 的错误日志存放目录
pid        /var/run/nginx.pid;      # Nginx 服务启动时的 pid 存放位置

events {
    use epoll;     # 使用epoll的I/O模型(如果你不知道Nginx该使用哪种轮询方法，会自动选择一个最适合你操作系统的)
    worker_connections 1024;   # 每个进程允许最大并发数
}

http {   # 配置使用最频繁的部分，代理、缓存、日志定义等绝大多数功能和第三方模块的配置都在这里设置
    # 设置日志模式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;   # Nginx访问日志存放位置

    sendfile            on;   # 开启高效传输模式
    tcp_nopush          on;   # 减少网络报文段的数量
    tcp_nodelay         on;
    keepalive_timeout   65;   # 保持连接的时间，也叫超时时间，单位秒
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;      # 文件扩展名与类型映射表
    default_type        application/octet-stream;   # 默认文件类型

    include /etc/nginx/conf.d/*.conf;   # 加载子配置项

    server {
        listen       80;       # 配置监听的端口
        server_name  localhost;    # 配置的域名

        location / {
            root   /usr/share/nginx/html;  # 网站根目录
            index  index.html index.htm;   # 默认首页文件
            deny 172.168.22.11;   # 禁止访问的ip地址，可以为all
            allow 172.168.33.44;  # 允许访问的ip地址，可以为all
        }

        error_page 500 502 503 504 /50x.html;  # 默认50x对应的访问页面
        error_page 400 404 error.html;   # 同上
    }
}
```

## 配置常用指令

### 指令介绍

指令是有 Context 的，不同的指令可以应用的 Context 可能也不同。

- **值指令**：主要是存储配置项的值，值指令可以合并，继承规则是向上覆盖，即子配置不存在时，直接使用父配置，子配置存在时，直接覆盖父配置。例如 `root`、`access_log`、`gzip` 等指令。
- **动作类指令**：主要是指定行为，此类指令不可以合并，例如 `rewrite`、`proxy_pass` 等指令，这些指令生效阶段一般是 `server_rewrite` 阶段、`rewrite` 阶段、`content` 阶段。

### main 全局配置

- **`worker_processes 1;`**
  定义在配置文件顶级 main 部分，worker 角色的工作进程个数。master 进程是接受并分配请求给 worker 处理。这个数值可以简单设置为 CPU 的核数 `grep ^processor /proc/cpuinfo | wc -l`，也可以是 `auto` 值。如果开启了 ssl 和 gzip，更应该设置成与逻辑 CPU 数量一样甚至为 2 倍，可以减少 I/O 操作。如果 Nginx 服务器还有其它服务，可以考虑适当减少。

- **`worker_cpu_affinity 0001 0010 0100 1000;`**
  定义在 main 部分。在高并发情况下，通过设置 cpu 粘性来降低由于多 CPU 核切换造成的寄存器等现场重建带来的性能损耗。如 `worker_cpu_affinity 0001 0010 0100 1000;`（四核）。

- **`use epoll;`**
  写在 events 部分。在 Linux 操作系统下，nginx 默认使用 epoll 事件模型，得益于此，nginx 在 Linux 操作系统下效率相当高。同时 Nginx 在 OpenBSD 或 FreeBSD 操作系统上采用类似于 epoll 的高效事件模型 kqueue。在操作系统不支持这些高效模型时才使用 select。

### http 配置

- **`sendfile on;`**
  开启高效传输模式，`sendfile` 指令指定 nginx 是否调用 `sendfile` 函数来输出文件，减少用户空间到内核空间的上下文切换。对于普通应用设为 `on`，如果用来进行下载等应用磁盘 IO 重负载应用，可设置为 `off`，以平衡磁盘与网络 I/O 处理速度，降低系统的负载。注意：如果图片显示不正常把这个改成 `off`。

- **`client_max_body_size 10m;`**
  允许客户端请求的最大单文件字节数。如果有上传较大文件，请设置它的限制值。

### server 虚拟主机

http 服务上支持若干虚拟主机。每个虚拟主机对应一个 `server` 配置项，配置项里面包含该虚拟主机相关的配置。在提供 mail 服务的代理时，也可以建立若干 `server`，每个 `server` 通过监听地址或端口来区分。

- **`listen 80;`**
  监听端口和地址，默认 80，小于 1024 的要以 root 启动，可以只指定端口或者指定地址和端口，例如 `listen *:80;`、`listen 127.0.0.1:80`。

- **`server_name localhost;`**
  服务器名，可以设置多个，第一个名字将成为主服务器名称（主域名），服务器名称可以使用 `*` 代替名称的第一部分或者最后一部分；也可以通过正则匹配（加 `~` 前缀），还可以使用正则表达式进行捕获。

#### 多个 server 块的匹配顺序

- 优先精确匹配，跟 `server` 块在 nginx.conf 中的顺序无关。
- 其次优先匹配 `*` 在前的泛域名。
- 其次优先匹配 `*` 在后的泛域名。
- 其次匹配到正则表达式，匹配顺序是按 nginx.conf 文件中的出现顺序匹配正则表达式域名。
- 最后会匹配到 default server，default server 又分为两种情况，第一种是匹配第一个 `server` 块，另一种情况是如果 `listen` 指令后面有 `default` 时，所在的 `server` 块就是 default server。

## Nginx 的 if 判断

`rewrite` 模块提供的，可以用在 `server`、`location` 上下文中，如果条件 condition 为真，则执行大括号内的指令；遵循值指令的继承规则。

```nginx
if (condition) {
  ……
}
```

### 括号中的表达式语法

#### 普通语法

- 当表达式只是一个变量时，如果值为空或任何以 0 开头的字符串都会当做 `false`。
- 直接比较变量和内容时，使用 `=` 或 `!=`。

```nginx
if ($request_method != POST) {
  return 405;
}
```

#### 正则语法

- `~` 和 `!~`：判断是否匹配正则表达式，区分大小写。
- `~*` 和 `!~*`：判断是否匹配正则表达式，不区分大小写。

```nginx
# 如果参数中有 id=1 则 301 到指定域名
if ($args ~ id=1) {
  rewrite ^ http://example.com permanent;
}
```

```nginx
location = /test.html {
  set $name aaa;
  # 如果参数中有 name=xxx 则使用该值
  if($args ~* name=(\w+?)(&|$)) {
    set $name $1;
  }

  # 301 跳转
  rewrite ^ /$name.html permanent;
  # /test.html => /aaa.html
  # /test.html?name=bbb => /bbb.html
}
```

### 文件及目录

- `-f` 和 `!-f`：判断是否存在文件。
- `-d` 和 `!-d`：判断是否存在目录。
- `-e` 和 `!-e`：判断是否存在文件、目录、软连接。
- `-x` 和 `!-x`：判断文件是否可执行。

```nginx
if (!-f $request_filename) {
  return 400;
}
```

### error_page 配置

`error_page` 指令的语法是 `error_page code... [=[response]] uri;`，可以使用的上下文是 `http`、`server`、`location`、`if in location`。

```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
error_page 404 =200 /empty.gif;   # 把状态码 404 替换成 200 返回给客户端
error_page 404 = /404.php;
error_page 403 http://example.com/forbidden.html;
error_page 404 =301 http://example.com/notfound.html;
```

根据 `@` 符号进行内部跳转。

## 安装方法

### yum / apt-get 安装

1. nginx 位于第三方的 yum 源里面，而不在 centos 官方 yum 源里面，所以需要安装第三方库。

   ```bash
   yum install epel-release
   ```

2. 安装 nginx。

   ```bash
   yum install nginx
   ```

3. 启动 nginx。

   ```bash
   nginx
   ```

   （使用 yum 安装可以直接使用命令，可能是已经作为了系统 server）

4. 配置所需要的配置文件即可，使用包管理软件安装的，配置文件默认在 `/etc/nginx/` 下，先行查看 `/etc/nginx/nginx.conf` 中 http 模块的 include 指向的包。

### 源码安装（服务器可联网）

#### 1. 一次性安装所需环境

```bash
yum -y install gcc openssl openssl-devel pcre pcre-devel zlib zlib-devel
```

检查各依赖：

```bash
# 检查 gcc 编译器是否安装
yum list installed | grep gcc
# 执行安装
yum install gcc -y

# 检查 openssl 库是否安装
yum list installed | grep openssl
# 执行安装
yum install openssl openssl-devel -y

# 检查 pcre 库是否安装
yum list installed | grep pcre
# 执行安装
yum install pcre pcre-devel -y

# 检查 zlib 库是否安装
yum list installed | grep zlib
# 执行安装
yum install zlib zlib-devel -y
```

#### 2. 下载并编译安装

```bash
# 使用 wget 下载，也可以手动传进去
wget https://nginx.org/download/nginx-1.24.0.tar.gz

# 没有 wget 可以使用该命令下载
yum install wget

# 环境配置好之后，将安装文件放在 /home/nginx/ 目录下并解压
tar -zxvf nginx-1.24.0.tar.gz

# 进入文件根目录，执行
cd nginx-1.24.0
./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module

# 执行命令进行编译和安装
make && make install
```

#### 3. 启动

```bash
# 普通启动方式
/usr/local/nginx/sbin/nginx

# 配置文件启动
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf

# 检查 nginx 是否启动，查看是否有 master 和 worker 进程
ps -ef | grep nginx
```

#### 4. 访问

此时可用浏览器访问 nginx 服务器：`http://IP地址`

## 示例

### 转发 API

```nginx
server {
    listen 80;
    server_name your.domain.com; # 替换为你自己的域名或IP地址

    location /api/ {
        proxy_pass http://localhost:8000; # 后端服务器地址和端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 其他location配置，例如静态文件服务等...
}
```

1. **`proxy_set_header Host $host;`**
   这行代码告诉 Nginx 将客户端请求中的 `Host` 头部原样转发给后端服务器。`$host` 变量包含了客户端请求中的主机名部分（即 HTTP 请求头中的 `Host` 字段），这对于基于虚拟主机配置的后端服务器尤其重要，因为它能确保后端正确解析请求并返回正确的网站内容。

2. **`proxy_set_header X-Real-IP $remote_addr;`**
   设置 `X-Real-IP` 头部，其值为 `$remote_addr`，即客户端的实际 IP 地址。这使得后端服务器能够获取到发起请求的真实客户端 IP，而不是看到反向代理服务器的 IP。这对于访问日志记录、IP 地址过滤或者基于 IP 的认证等功能非常关键。

3. **`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`**
   `X-Forwarded-For` 头部用来记录请求经过的所有代理服务器的 IP 以及客户端的 IP 地址。`$proxy_add_x_forwarded_for` 变量会包含客户端的 IP 地址，并且如果请求已经经过了多个代理，还会包含之前代理的 IP 地址，形成一个 IP 链路。这对于追踪请求的原始来源、日志记录以及安全审计等场景非常有用。

4. **`proxy_set_header X-Forwarded-Proto $scheme;`**
   此指令设置了 `X-Forwarded-Proto` 头部，其值为 `$scheme`，即客户端请求使用的协议（HTTP 或 HTTPS）。这对于后端服务器判断并适当地响应 HTTP 或 HTTPS 请求非常重要，特别是在 Nginx 作为 HTTPS 终止点，而后端服务器仍然需要知道原始请求协议的情况下。

### 转发 Swagger

```nginx
location ~* ^(/v2|/webjars|/swagger-resources|/swagger-ui.html) {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_pass http://voip-conf-server:8080;
}
```

1. **`proxy_redirect off`**
   这个配置项用来控制 Nginx 是否修改从后端服务器返回的响应头中的 `Location` 和 `Refresh` 字段。默认情况下，Nginx 会尝试根据代理的配置自动调整这些字段中的 URL，以保持客户端请求的一致性。设置为 `off` 意味着 Nginx 不会修改这些头信息，后端服务器返回什么，Nginx 就原样传递给客户端。

2. **`proxy_http_version 1.1`**
   指定使用 HTTP/1.1 版本进行代理通信。这在现代 Web 服务中很常见，因为 HTTP/1.1 支持持久连接、管道化请求等特性，有利于提高性能和效率。对于 WebSocket 等需要 HTTP 升级的场景，这个配置也是基础要求。

3. **`proxy_set_header Host $host`**
   设置转发到后端服务器的请求头 `Host` 为客户端请求中的 `Host` 字段值（即 `$host` 变量）。这确保了后端服务器能够识别到原始请求是针对哪个域名或 IP 地址发出的，对处理虚拟主机配置尤为重要。

4. **`proxy_set_header Upgrade $http_upgrade`**
   当与 WebSocket 等协议一起使用时，此设置允许将客户端的 `Upgrade` 请求头传递给后端服务器。这对于启用 WebSocket 协议升级是必要的，因为它告诉后端服务器客户端想要升级到更高级的通信协议（如从 HTTP 升级到 WebSocket）。

5. **`proxy_set_header Connection "upgrade"`**
   当使用 WebSocket 或其他需要连接升级的协议时，设置 `Connection` 头为 `upgrade`。这是协议升级过程的一部分，告诉后端服务器客户端和代理都支持连接升级。

6. **`proxy_set_header X-Real-IP $remote_addr`**
   设置请求头 `X-Real-IP` 为客户端的实际 IP 地址（`$remote_addr` 变量）。这对于通过代理传递客户端真实 IP 地址给后端服务器很有用，特别是当后端需要基于 IP 进行访问控制、日志记录或地理位置处理时。

7. **`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`**
   添加或更新请求头 `X-Forwarded-For`，其中包含客户端的 IP 地址以及任何上游代理的 IP 地址（如果存在）。这个头部信息可以帮助后端了解完整的请求链路，对追踪、日志记录和安全分析很有帮助。

8. **`proxy_set_header X-Forwarded-Proto $scheme`**
   设置请求头 `X-Forwarded-Proto` 为客户端请求的协议类型（`http` 或 `https`），由变量 `$scheme` 提供。这使得后端服务器能够识别到原始请求是通过 HTTP 还是 HTTPS 发起的，对正确构建重定向或安全响应特别重要，尤其是在 Nginx 作为 HTTPS 反向代理的情况下。
