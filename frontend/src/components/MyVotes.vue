<template>
  <div>
    <template v-if="myVotesInfo.length != 0">
      <el-card  v-for="(vote,index) in myVotesInfo" :key="index">
        <div slot="header" class="clearfix">
          <span style="font-weight:bolder;font-size:20px">{{vote.votename}}</span>
          <el-button style="float: right; padding: 3px " type="text" @click="delVote(vote.id,index)">删除</el-button>
          <el-button style="float: right; padding: 3px " type="text" @click="getVote(vote.id)">查看</el-button>
        </div>
        <div style="line-height:2em">
            描述：{{vote.description ? vote.description : '无'}}
        </div>
        <div style="line-height:2em">
            状态：{{deadline(vote)}}
        </div>
        <div style="line-height:2em">
            截止时间：{{new Date( vote.deadline).toLocaleString() }}
        </div>
      </el-card>
    </template>
    <el-card v-if="myVotesInfo.length ==0" style="text-align:center">
        您还没有投票,赶快去创建吧！
    </el-card>
  </div>
</template>

<script>
import axios from "axios"
export default {
  computed:{
        myVotesInfo(){
          return this.$parent.$parent.myVotesInfo;
        },

      },
      methods:{
        deadline(vote) {
          if(vote.deadline > Date.now()){
            return "进行中";
          } else{
            return "已结束";
          }
        },
        async delVote(id,index){
           let response =  await axios.delete("/vote/" + id,{
             foo:"1"
           });
           let data = response.data;
           if(data.code){
             this.$alert("删除成功", {
               confirmButtonText: '确定',
             }).then(() => {
               this.myVotesInfo.splice(index,1);
             })
           }else{
             console.log(data.msg)
           }
        },
        getVote(id){
          this.$router.push("/vote/" + id);
        }
      }
}
</script>