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
  name: 'index',
}
</script>
