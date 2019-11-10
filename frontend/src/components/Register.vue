<template>
  <div>
    <h3 class="register-header">注册你的账号</h3>
      <el-form :model="registerInfo" status-icon  label-width="100px" label-position="top" :rules="rules">
        <el-form-item label="用户名" :model="registerInfo.username"    prop="username">
          <el-input type="text" v-model="registerInfo.username" autocomplete="off" ></el-input>
        </el-form-item>
        <el-form-item label="密码" :model="registerInfo.password"   prop="password">
          <el-input type="password" v-model="registerInfo.password" autocomplete="off" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :model="registerInfo.email" prop="email">
          <el-input type="email" v-model="registerInfo.email" autocomplete="off" ></el-input>
        </el-form-item>

        <el-form-item label="选择头像：" :line="true">
          <el-upload
            class="avatar-uploader"
            action=""
            ref="uploadAvatar"
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="register"
            :on-change="handlePictureCardPreview"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item>
              <el-button  @click="register" style="width:100%" round type="primary">注册</el-button>
        </el-form-item>

      </el-form>
  </div>
</template>
<style >
.avatar-uploader-icon::before {
  line-height: 100px;
}
</style>



<script>
import axios from "axios"
export default {
  data(){
    let validateEmail = (rule,value,callback) => {
      let reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
      if(!reg.test(value)){
        callback(new Error("邮箱格式不正确"));
      }else{
        callback();
      }
    }
    return {
      registerInfo:{
        username:"",
        password:"",
        email:"",
      },
      rules:{
        password:[
          {required:true,message:"密码不能为空",trigger:"blur"}
        ],
        username:[
          { required: true, message: "用户名不能为空", trigger: "blur" }
        ],
        email:[
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          { validator: validateEmail,trigger:"blur"},
        ]
      },
      imageUrl:""
    }
  },
  methods: {
    handlePictureCardPreview(file) {
      this.imageUrl = URL.createObjectURL( file.raw);
    },
    async register(){
      const data = new FormData();

      data.append("username", this.registerInfo.username); //表单数据
      data.append("email", this.registerInfo.email); //表单数据
      data.append("password", this.registerInfo.password); //表单数据

      let file = this.$refs.uploadAvatar.uploadFiles[0].raw;
      data.append("avatar", file);//avatar数据

      let option = {
        method:"post",
        url:"/register",
        data: data,
        header:{
          "Content-Type":"'multipart/form-data'"
        }
      }
      let response = await axios(option);
      if(response.data.code){
        this.$alert("恭喜你！注册成功！",{
          confirmButtonText:"前往登录"
        }).then(() => {
          let voteid = this.$route.query.voteid
          if(voteid){
            this.$router.push("/login?voteid=" + voteid);
          }else{
            this.$router.push("/login");
          }
        })
      }else{
        this.$alert("用户名已存在", {
          confirmButtonText: '重新输入',
        }).then(() => {
          this.registerInfo.username = "";
          this.registerInfo.password = "";
        })
      }
    }
  },
}
</script>