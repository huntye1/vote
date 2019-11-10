<template>
  <div>
    <h3 class="login-header">登录你的账号</h3>
    <el-form :model="loginUser" status-icon  label-width="100px" label-position="top" :rules="rules" ref="loginForm">
      <el-form-item label="账号"   prop="username">
        <el-input type="text" v-model="loginUser.username" autocomplete="off" ></el-input>
      </el-form-item>
      <el-form-item label="密码"  prop="password">
        <el-input type="password" v-model="loginUser.password" autocomplete="off" ></el-input>
      </el-form-item>
      <el-form-item>
        <el-row  type="flex" justify="center">
          <el-col :span="6" ><el-button type="primary" @click="login()">登录</el-button></el-col>
          <el-col :span="6" >
            <el-button  @click="register">注册</el-button>
              <el-link type="info" class="foget-pw">忘记密码</el-link>
          </el-col>
          
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import axios from "axios"

export default {
  data() {
    return {
      loginUser: {},
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          let response = await axios.post("/login", this.loginUser);
          let data = response.data;
          if (data.code) {
            this.$alert("登录成功", {
              confirmButtonText: '确定',
            }).then(() => {
              let voteid = this.$route.query.voteid
              if(voteid){
                this.$router.push("/vote/" + voteid);
              }else{
                this.$router.push("/index");
              }
            })
          } else {
            this.$alert("账号或密码错误", {
              confirmButtonText: '重新输入',
            }).then(() => {
              this.loginUser.password = "";
            })
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
      
    },
    register() {
      let voteid = this.$route.query.voteid
      if(voteid){
        this.$router.push("/register?voteid=" + voteid);
      }else{
        this.$router.push("/register")
      }
    }
  },
}
</script>