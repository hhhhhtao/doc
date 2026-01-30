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
- 
### 测试连接
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

## 初始化本地仓库
```sh
// 初始化仓库
git init

// 创建 .gitignore 过滤无需上传的文件

// 文件加入缓存
git add .

// 提交文件
git commit -m "first commit"

// 重新命名本分支
git branch -M master

// 增加远程库链接
git remote add origin <git ssh>

// 把本地代码推到远程库
git push -u origin master
```

## 查看日志
```sh
// 完整提交历史
git log

// 简化的一行格式显示提交历史记录
git log --pretty=oneline
```

## git commit 提交描述规范
提交格式：`<type>(<scope>): <subject>`  
提交类型(type)、作用域(scope，可选，个人一般不指定作用域)、主题(subject)  
提交类型指定为下面其中一个：

- build：对构建系统或者外部依赖项进行了修改
- ci：对CI配置文件或脚本进行了修改
- docs：对文档进行了修改
- feat：增加新的特征
- fix：修复bug
- pref：提高性能的代码更改
- refactor：既不是修复bug也不是添加特征的代码重构
- style：不影响代码含义的修改，比如空格、格式化、缺失的分号等
- test：增加确实的测试或者矫正已存在的测试

主题：简要描述即可。

## 修改/增加远程地址
```sh
// 查看远程仓库地址 (fetch)拉下来的地址，(push)提交的地址
git remote -v

// 添加远程仓库地址
git remote add <自定义名> <远程仓库SSL地址>

//删除远程地址
git remote rm origin

//更换远程地址
git remote add origin <URL>

// 把当前分支与远程分支关联
git push -u origin <我的分支名> git
```

## 版本回滚
```sh
// 查看日志，找到要重置的commitID 
git log 

// --hard 工作区和暂存区都会被清空，修改完全被重置
git reset --hard <commitID>  

// --soft 当前commit版本 和 回滚commit版本之间的变更，都会被存放在暂存区中
git reset --soft <commitID>

// --mixed 这也是reset的默认参数,当前commit版本 和 回滚commit版本之间的变更，都会被存放在工作区中
git reset --mixed <commitID>

// 回滚已经push到远程的变更，git revert实际上会产生一次新的commit，因此可以继续push到远程仓库
// 注意：使用git revert时要确保 工作区 和 暂存区 是干净的

// 撤销最近一次commit
git revert HEAD

// 撤销指定的版本的commit
git revert <commitID>
```

## 变更撤销
```sh
// 撤销 工作区 中的文件变更
git restore <文件名>

// 或者可以使用 checkout 切记：使用checkout不能忘记“--” 因为“git checkout”还可以用于分支管理的高级功能
git checkout --文件名

// 撤销 暂存区 中的文件变更
// 先把文件退回到 工作区
git reset HEAD <文件名>

// 然后 撤销文件变更
git restore <文件名>
```

## 分支管理
每次提交，Git都把它们串成一条时间线，这条时间线就是一个分支。
```sh
// 创建分支
git branch <分支名>

// 切换分支
git switch <分支名>

// 查看分支
git branch

// 合并分支
git merge <分支名>

// 删除本地分支
git branch -d <分支名>
// 删除远程分支
git push origin --delete ${branch_name}

// 查看本地分支与远程分支的关系
git branch -vv

// 本地分支重命名
git branch -m {原分支名} {新分支名}
// 然后删除远程分支
git push origin --delete {原分支名}
// 之后提交修改了名字的分支
git push origin {新分支名}

// 同步远程分支
git fetch -p
```

## 创建分支
```sh
// 创建一个以当前分支作为父分支的分支
推荐： git checkout -b <branchName> // 创建分支并切换到该分支
git branch <branchName> // 创建分支
git checkout <branchName> // 切换分支

// 创建一个与主分支没有关联的分支
git checkout --orphan <branchName>

// 尽管创建分支时没有了父分支，但创建成功后，原分支的文件会在创建时添加到当前的暂存区
// 选择不需要的删除掉
git rm -f -r <fileName> // -r 递归删除文件夹
git rm -f <fileName> // -f 强制删除站暂存区和工作区
git rm --cached <fileName> // 只是删除暂存区的记录
// 如果全都是不需要的则使用：
git rm -rf .

// 清除完毕后就可以将项目文件复制到这个项目文件夹中了，注意 .gitignore 填写忽略上传的文件

// 复制完成后可以试试切换分支，看看两个分支文件是不是不一样

// add -> commot

// 推送到github
git push origin <branchName>

/*
 * 新分支push到远程库后，需要与远程的我们push上去的分支关联一下，这样在分支pull的时候就知道是要拉取远程库的哪一个分支了
 * 在clone的时候拉下来的分支不需要这样做，因为已经帮我们做了这一步
 */ 
git branch -u origin/<origin-branchName> <local-branchName>

/*
 * 强制覆盖远程仓库
 * 强制推送前建议先把需要被覆盖的分支拉出一个备份分支
 * 强制推送后，建议直接所有提交都完成的情况下，删除掉本地仓库，从新拉取，避免被覆盖分支本地和远程不一致的问题，或者拉取远程直接-f覆盖本地
 */
git push origin <branchName>:<local-branchName> -f
```

## .gitignore 忽略文件
要忽略一个目录下的某个文件或者文件夹，只需要在 .gitignore 中进行配置，我们可以在这个本地仓库的根目录下配置 .gitignore 文件
.gitignore 文件中的修改会立即生效是因为 Git 在执行操作时会实时读取这个文件的内容，并根据其中的规则来处理文件

如果我们在创建/更新 .gitignore 之前某个文件就已经存在git索引中的话，就需要删除掉索引
```sh
git rm --cached <文件名> 
git rm --cached */<文件名>
git rm -r --cached {文件夹}
git rm -r --cached */{文件夹}
```