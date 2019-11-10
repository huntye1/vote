<style lang="css">
  .vote-header{
    text-align: center;
    color: #606266;
  }
  .vote-description {
    text-align: center;
    font-size: 14px;
    color: #909399;
  }
  .vote-option-item {
    text-align: center;
    padding: 10px;
    margin:10px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .vote-deadline{
    margin: 30px;
    font-size: 14px;
    color: #909399;
  }
  .vote-option{
    text-align: left;
  }
  .vote-votesup-avatar{
    display:flow-root;
    padding-left: 100px;
    height: 20px;
    margin-top: 5px;
  }
  .vote-votesup-avatar span{
    float: left;
  }

</style>
<template>
  <el-card>
    <el-button @click="handleBackHome">我的主页</el-button>
    <h3 class="vote-header">{{voteInfo.isSingle === 1 ? "【单选】" : "【多选】"}}{{voteInfo.votename}}</h3>
    <div class="vote-description">描述：{{voteInfo.description}}</div>
    <div 
      class="vote-option-item"  
      v-for="option in voteInfo.options" 
      :key="option.id" 
      @click="handleVoteup(option.id)"
    >
      <el-row >
      <i class="el-icon-check" v-show="isSelect(option.id)"></i>
      <i class="el-icon-loading" v-show="option.id === loadingId"></i>
      <el-col :span="4" class="vote-option">{{option.content}} / {{countedVotesUp[option.id] || 0}}票</el-col>
      <el-col :span="18">
         <el-progress 
         :text-inside="true" 
         :stroke-width="26" 
         :percentage="percent(option.id)" 
         :status="isSelect(option.id)"
         >
         </el-progress>
      </el-col>
      </el-row>
      <div class="vote-votesup-avatar">
        <span 
          v-for="(avatar,idx) in (groupedVotesUp[option.id] || []).map(it =>  it.avatar)" 
          :key="idx"
        >
          <el-avatar size="small" :src="'/uploads/' + avatar"></el-avatar>
        </span>
      </div>
    </div>
    <div class="vote-deadline">
    状态：{{voteInfo.deadline > Date.now() ? "进行中" : "已截止"}}
    </div>
  </el-card>
</template>

<script>
import axios from "axios";
import io from "socket.io-client";
import _ from "lodash";
export default {
  data(){
    return {
      id: this.$route.params.id,
      userid:"",
      voteInfo:{},
      votesup:[],
      loadingId:-1,
      socket:null,
    }
  },
  async mounted(){
    let response = await axios.get("userinfo");
    let data =response.data;
    if(!data.code){
      this.$alert("投票请先登录！")
      this.$router.push("/login?voteid=" + this.id );
    }
    this.getVoteInfo(this.id);
    let socket = io();
    this.socket = socket;
    socket.emit("joinRoom",{roomId:this.id});
    socket.on("singleChange",msg => {
      this.votesup.find(it => it.userid == msg.userid).optionid = msg.optionId;
    })
    socket.on("singleNew",msg => {
      this.votesup.push({
        optionid:+msg.optionId,
        userid:+msg.userid,
        avatar:msg.avatar.avatar
      })
    })
    socket.on("multipleNew",msg => {
      this.votesup = [...this.votesup,{
        optionid:+msg.optionId,
        userid:+msg.userid,
        avatar:msg.avatar.avatar
      }]
    })
    socket.on("multipleCancel",msg => {
      this.votesup = this.votesup.filter(it => !(it.userid == msg.userid && it.optionid == msg.optionId));
    })
  },
  beforeDestroy(){
    if(this.socket){
      this.socket.close();
    }
  }
  ,
  computed:{
    countedVotesUp(){
      return _.countBy(this.votesup,it => {
        return it.optionid
      });
    },
    groupedVotesUp(){
      return _.groupBy(this.votesup,it=> {
        return it.optionid;
      })
    }
  },
  methods:{
    async getVoteInfo(id){
      let response =  await axios.get("/vote/" + id);
      let data = response.data;
      this.voteInfo = {
        votename : data.voteInfo.votename,
        description:data.voteInfo.description,
        options:data.optionsInfo,
        isSingle:data.voteInfo.issingle,
        deadline:data.voteInfo.deadline
      };
      this.userid = data.userid;
      this.votesup = data.votesup;
    },
    isSelect(id){
      if(this.votesup.find(it => it.optionid == id && it.userid == this.userid)) {
        return "success";
      }
    },
    percent(id){
      if(this.voteInfo.isSingle){
        let counted = this.countedVotesUp || {};
        let total = this.votesup.length || 1;
        let n = counted[id] || 0;
        return (n / total).toFixed(2) * 100;
      }else{
        let counted = this.countedVotesUp || {};
        let total = _.uniqBy(this.votesup,it => it.userid).length || 1;
        let n = counted[id] || 0;
        return (n / total).toFixed(2) * 100;
      }
    },
    handleBackHome(){
      this.$router.push('/');
    },
    async handleVoteup(optionId){
      if(Date.now() > this.voteInfo.deadline) {
        this.$alert("投票已截止！")
        return;
      }
      if(this.loadingId !== -1){
        return
      }

      this.loadingId = optionId;
      if(this.voteInfo.isSingle){ // 单选
        if(!this.votesup.find(it => it.userid == this.userid)) {
          await axios.post("/vote/" + this.id,{
            type:"singleNew",
            optionId,
          });
        }
        if(!this.isSelect(optionId)){ // 改变选项。
          await axios.post("/vote/" + this.id,{
            type:"singleChange",
            optionId,
          });
        }
      }else{ //多选
        if(this.isSelect(optionId)){ // 取消选项
          await axios.post("/vote/" + this.id,{
            type:"multipleCancel",
            optionId,
          })
        }else{ //新增选项
          await axios.post("/vote/" + this.id,{
            type:"multipleNew",
            optionId,
          })
        }
      }
      this.loadingId = -1;
    }
  }
}
</script>