<template>
  <el-card>
    <h3 class="create-header">创建投票</h3>
    <el-form
      :model="voteInfo"
      label-position="left"
      label-width="100px"
      :rules="rules"
      ref="voteForm"
    >
      <el-form-item label="投票名称" prop="title">
        <el-input v-model="voteInfo.title"></el-input>
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="voteInfo.description"></el-input>
      </el-form-item>

      <el-form-item
        v-for="(option,index) in voteInfo.options"
        :label="'选项'+(index + 1)"
        :key="'option'+ index"
      >
        <el-col :span="22">
          <el-input v-model="voteInfo.options[index]"></el-input>
        </el-col>
        <el-col :span="2" class="create-del-icon">
          <el-link :underline="false">
            <i class="el-icon-delete el-icon--left" @click="delOption(index)"></i>
          </el-link>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOption">添加选项</el-button>
      </el-form-item>
      <el-form-item label="单选/多选" prop="issingle">
        <el-radio-group v-model="voteInfo.issingle">
          <el-radio label="1">单选</el-radio>
          <el-radio label="0">多选</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="截止时间" prop="deadline">
        <el-date-picker
          v-model="voteInfo.deadline"
          type="datetime"
          placeholder="选择日期时间"
          align="right"
          :picker-options="pickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit()">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import axios from "axios"

export default {
  data(){
    return {
      voteInfo:{
        title:"",
        description:"",
        options:["",""],
        issingle:"1",
        deadline:"",
      },
      rules:{
        title:[{required:true,message:"请输入投票标题",trigger:"blur"}],
        deadline: [{ required: true, message: "请选择投票日期", trigger: "blur" }],
        issingle:[{required:true}]
      },
      pickerOptions:{
        shortcuts:[
          {
            text:"一天后",
            onClick(picker){
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          },
          {
            text: "三天后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 3);
              picker.$emit('pick', date);
            }
          },
          {
            text: "一周后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          },
        ]
      }
    }
  },
  methods:{
    addOption(){
      this.voteInfo.options.push("");
    },
    submit(){
      this.$refs.voteForm.validate(async(valid) => {
        if (valid) {
          let sendData = this.voteInfo;
          sendData.deadline = this.voteInfo.deadline.toString();
          let response = await axios.post("/create", sendData)
          let data = response.data;
          if (data.code) {
            this.$confirm('即将跳转投票页面', "创建成功", {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'success'
            }).then(() => {
              this.$router.push("/vote/" + data.voteid);
              this.$parent.$parent.updateData();
            }).catch(() => {
              this.$router.push("/");
              this.$parent.$parent.updateData();
            })
          } else {
            this.$alert("创建失败，请重试！");
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    delOption(index){
      if(this.voteInfo.options.length < 2){
        this.$notify({
          title: '提示',
          message: '投票至少有一个选项',
          type: 'warning',
          offset:200,
        });
        return
      }
      this.voteInfo.options.splice(index,1);
    }
  },
}
</script>