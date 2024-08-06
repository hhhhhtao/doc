# git使用说明

## 第一次使用git的准备
### 设置用户信息
1. 设置用户名
   ```sh
   git config --global user.name "{用户名}"
   ```
2. 设置邮箱
   ```sh
   git config --global user.email "{邮箱}"
   ```
3. 查看全局属性
    ```sh
    git config --global --list
    ```

### 生成SSH公私钥
```sh
ssh-keygen -t rsa -C "{邮箱}"
```
git会在`/当前的用户目录/.ssh`下生成一对公私钥，`id_rsa`是私钥，`id_rsa.pub`是公钥

### 登录github
- 进入github官网
- 点击头像
- 点击`settings`
- 在左侧边栏点击`SSH and GPG keys`
- 找到`SSH keys`，点击`New SSH key`
- 在key输入框中，输入公钥（id_rsa.pub），点击`Add SSH key`
#### 测试连接
```sh
// 测试连接
ssh -T git@github.com

// 显示连接信息
ssh -v git@github.com
```

## 克隆代码
```sh
// 克隆远程仓库中的项目，在远程仓库右上角的code上选择ssh然后复制下面的url
git clone {url}

// 克隆指定分支
git clone -b {分支名} {url}
```

## 推送代码
```sh
// 查看修改了什么文件,本地仓库当前的状态
git status

// 修改文件后，需要把文件从工作区提交到暂存区
git add 文件名 / git add .

// 从暂存区提交到本地仓库
git commit -m "写一句话描述修改了什么"

// 拉取最新代码
git pull

// 推到远程仓库
git push
```
> 提示：  
> 在执行上面的操作时，如果代码不是克隆下来的（克隆下来的代码会自动做关联），那么就是需要指定需要pull / push 的仓库和分支的。  
>
> 例如：git pull/push -u {origin} {branch}  
> git pull -u origin master  
> git push -u origin master

## 查看日志
```sh
// 完整提交历史
git log

// 简化的一行格式显示提交历史记录
git log --pretty=oneline
```