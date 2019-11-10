<template>
  <div>
    <template v-if="partInfo.length != 0">
      <el-card v-for="(vote,index) in partInfo" :key="index">
        <div slot="header" class="clearfix">
          <span style="font-weight:bolder;font-size:20px">{{vote.votename}}</span>
          <el-button style="float: right; padding: 3px " type="text" @click="getVote(vote.id)">查看</el-button>
        </div>
        <div style="line-height:2em">描述：{{vote.description ? vote.description : '无'}}</div>
        <div style="line-height:2em">状态：{{deadline(vote)}}</div>
      </el-card>
    </template>
    <el-card v-if="partInfo.length ==0" style="text-align:center">您还没有参与投票,赶快去参与吧！</el-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      partInfo : []
    }
  },
  mounted(){
    axios.get("/participation").then(res => {
      if(res.data.length){
        this.partInfo = res.data.reverse();
      }
    })
  },
  methods:{
    deadline(vote){
      if(vote.deadline > Date.now()){
        return "进行中";
      } else{
        return "已结束";
      }
    },
    getVote(id){
      this.$router.push("/vote/" + id);
    }
  }
}
</script>