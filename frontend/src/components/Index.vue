<template>
  <el-card>
    <div class="vote-topbar">
      <el-avatar size="medium" :src="avatarUrl" class="topbar-avatar"  ></el-avatar>
      <el-divider direction="vertical"></el-divider>
      <span class="username">Welcome,<span>{{userInfo.username}}</span></span>
      <el-divider direction="vertical"></el-divider>
      <el-link type="primary" @click="signout">登出</el-link>
    </div>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">我的投票</el-menu-item>
      <el-menu-item index="2">创建投票</el-menu-item>
      <el-menu-item index="3">我参与的投票</el-menu-item>
    </el-menu>
    <router-view>
    </router-view>
  </el-card>
</template>

<style>
  .username span{
    font-weight: bolder;
  }
</style>

<script>
import axios from "axios"

export default {
  name:"index",
  data() {
        return {
          userInfo: {
            username: '',
            avatar: ''
          },
          myVotesInfo: []
        }
      },
      methods:{
        async signout(){
          let responese = await axios.delete("/signout");
          let data = responese.data;
          if(data.code){
            this.$router.push("/login");
          }else{
           console.log(data.msg); 
          }
        },
        handleSelect(key){
          if(key == 1){
            this.$router.push("/index/myvotes");
          }
          if(key == 2){
            this.$router.push("/index/create");
          }
          if(key == 3) {
            this.$router.push("/index/myparticipation")
          }
        },
         async updateData() {
          let response = await axios.get("/userinfo");
          let data = response.data;
          if (data.code) {
            this.userInfo = {
              avatar: data.user.avatar,
              username: data.user.username
            };
            this.myVotesInfo = data.votesInfo.reverse();
          } else {
            this.$router.push("/login");
          }
        }
      },

      computed: {
        avatarUrl(){
          if(this.userInfo.avatar){
            return '/uploads/' + this.userInfo.avatar
          }else{
            return "";
          }
        },
        activeIndex(){
          if(this.$route.path === "/index/create") {
            return "2";
          }else if(this.$route.path === "/index/myvotes") {
            return "1";
          }else if(this.$route.path === "/index/myparticipation"){
            return "3"
          }
          return "1";
        }
      },

      mounted() {
        this.updateData();
      },
}
</script>