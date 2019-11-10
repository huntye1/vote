<template>
  <div id="app" class="main">
      <el-container>
        <el-header>
          <h1>简单的投票系统</h1>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
  </div>
</template>

<script>

export default {
  name: 'app',
}
</script>

<style>
    html {
    height: 100%;
  }

  body {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    color: #606266;
    height: 100%;
  }

  .main {
    width: 700px;
    margin: 0 auto;
    min-height: 100%;
    background-color: #F2F6FC;
    box-shadow: 0 0 5px rgb(0,0,10,0.2);
  }
  .el-header {
    background-color: #E4E7ED;
  }
  .el-header h1 {
    text-align: center;
    line-height: 60px;
    margin: 0;
  }

  .foget-pw {
    margin-left: 10px;
  }
  
  .login-header,
  .register-header {
    text-align: center;
  }

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }
  .vote-topbar {
    line-height: 40px;
  }
  .topbar-avatar {
    position: relative;
    top: 10px;
    margin: 0 10px;
  }
  .vote-topbar .username {
    margin: 0 10px;
  }
  .create-header {
    text-align: center;
    line-height: 80px;
  }
  .create-del-icon {
    text-align: center;
  }
  </style>
