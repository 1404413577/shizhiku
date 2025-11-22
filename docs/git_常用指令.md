# git 常用指令

以下是 Git 常用指令的汇总，涵盖了日常开发中最常用的操作：

### 基础配置
```bash
# 配置用户名
git config --global user.name "Your Name"

# 配置用户邮箱
git config --global user.email "your.email@example.com"

# 查看配置信息
git config --list
```

### 仓库操作
```bash
# 初始化本地仓库
git init

# 克隆远程仓库
git clone <远程仓库URL>

# 查看远程仓库信息
git remote -v

# 添加远程仓库
git remote add origin <远程仓库URL>

# 更改远程仓库地址
git remote set-url origin <新远程仓库URL>
```

### 工作区与暂存区操作
```bash
# 查看文件状态
git status

# 将文件添加到暂存区
git add <文件名>       # 添加指定文件
git add .             # 添加所有修改的文件

# 将暂存区文件撤销
git reset <文件名>     # 撤销指定文件
git reset             # 撤销所有暂存区文件

# 提交暂存区文件到本地仓库
git commit -m "提交说明"

# 提交时直接将所有已跟踪文件的修改提交
git commit -am "提交说明"

# 撤销工作区的修改（恢复到最近一次提交状态）
git checkout -- <文件名>
```

### 分支操作
```bash
# 查看所有分支
git branch

# 创建新分支
git branch <分支名>

# 切换分支
git checkout <分支名>

# 创建并切换到新分支
git checkout -b <分支名>

# 删除分支
git branch -d <分支名>  # 安全删除（需合并后才能删除）
git branch -D <分支名>  # 强制删除

# 合并分支（当前分支合并目标分支）
git merge <目标分支名>
```

### 远程操作
```bash
# 拉取远程仓库更新（不合并）
git fetch

# 拉取远程仓库更新并合并到当前分支
git pull origin <分支名>

# 推送本地分支到远程仓库
git push origin <分支名>

# 推送本地所有分支到远程仓库
git push --all origin

# 删除远程分支
git push origin --delete <分支名>
```

### 版本回退
```bash
# 查看提交历史
git log                  # 详细日志
git log --oneline        # 简洁日志
git log --graph          # 图形化展示

# 回退到指定版本
git reset --hard <提交ID>

# 查看所有操作记录（包括已删除的提交）
git reflog
```

### 其他常用指令
```bash
# 查看工作区与暂存区的差异
git diff

# 查看暂存区与本地仓库的差异
git diff --cached

# 忽略文件配置（创建.gitignore文件）
touch .gitignore        # 添加不需要跟踪的文件/目录

# 暂存当前工作区内容（用于切换分支）
git stash

# 恢复暂存的内容
git stash pop

# 查看标签
git tag

# 创建标签
git tag <标签名>

# 推送标签到远程
git push origin <标签名>
```

这些指令覆盖了 Git 的基本使用场景，熟练掌握可以有效提高版本控制效率。根据具体需求，还可以组合使用这些指令完成更复杂的操作。