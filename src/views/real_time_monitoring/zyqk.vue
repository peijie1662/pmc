<template>
  <div>
    <div class="header">
      <el-select v-model="ypIndex" placeholder="请输入船舶代码" @change="vscdChg" size="small">
        <el-option v-for="(yp,index) in yps" :key="index" :label="yp.vscn" :value="index">
          <span style="float: left">{{ yp.vscd }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ yp.vscn }}</span>
        </el-option>
      </el-select>
      <el-input
        v-model="imvsvy"
        size="small"
        placeholder="进口航次"
        style="width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <el-input
        v-model="exvsvy"
        size="small"
        placeholder="出口航次"
        style="width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <el-button type="primary" plain size="small" style="margin-left:5px;" @click="addVoyage">添加</el-button>
      <el-switch
        v-model="disSwitch"
        active-text="图表显示"
        inactive-text="文字显示"
        style="margin-left:20px;"
      ></el-switch>
    </div>
    <div>
      <el-progress
        :percentage="progressVal"
        status="success"
        :stroke-width="2"
        style="width:800px;"
      ></el-progress>
    </div>
    <div class="content">
      <el-collapse v-model="activeNames">
        <el-collapse-item v-for="(voyage,index) in watchVoyages" :key="index" :name="index">
          <template slot="title">
            <div style="width:200px;">{{voyage.voy}}</div>
            <table style="transform:scale(0.8)">
              <thead>
                <tr>
                  <th>尺寸</th>
                  <th>计卸</th>
                  <th>实卸</th>
                  <th>差额</th>
                  <th>计装</th>
                  <th>实装</th>
                  <th>差额</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>20</td>
                  <td>{{voyage.jx2}}</td>
                  <td>{{voyage.sx2}}</td>
                  <td :style="showCe(voyage.xce2)">{{voyage.xce2}}</td>
                  <td>{{voyage.jz2}}</td>
                  <td>{{voyage.sz2}}</td>
                  <td :style="showCe(voyage.zce2)">{{voyage.zce2}}</td>
                </tr>
                <tr>
                  <td>40</td>
                  <td>{{voyage.jx4}}</td>
                  <td>{{voyage.sx4}}</td>
                  <td :style="showCe(voyage.xce4)">{{voyage.xce4}}</td>
                  <td>{{voyage.jz4}}</td>
                  <td>{{voyage.sz4}}</td>
                  <td :style="showCe(voyage.zce4)">{{voyage.zce4}}</td>
                </tr>
              </tbody>
            </table>
            <i
              class="el-icon-circle-plus-outline"
              style="width:50px;height:16px;margin-left:20px;color:green;"
              @mousedown="openNewDialog(index)"
            >添加</i>
            <i
              class="el-icon-remove-outline"
              style="width:50px;height:16px;margin-left:10px;color:red;"
              @mousedown="delWatchVoyage(voyage.voy)"
            >删除</i>
          </template>
          <div class="voyage">
            <WatchRange
              v-for="(wr,index) in voyage.watchRanges"
              :key="index"
              style="display:inline-block;margin-left:15px;"
              :watchRange="wr"
              :disSwitch="disSwitch"
              @delWatchRange="delWatchRange(voyage,index)"
            ></WatchRange>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <el-dialog title="添加监控区间" :visible.sync="newDialogVisible" width="300px">
      <div>
        <span>起始贝</span>
        <el-input-number
          v-model="newWatchRange.bgBay"
          controls-position="right"
          :min="1"
          :max="99"
          size="mini"
          style="width:120px;margin-left:10px;"
        ></el-input-number>
      </div>
      <div style="margin-top:20px;">
        <span>结束贝</span>
        <el-input-number
          v-model="newWatchRange.edBay"
          controls-position="right"
          :min="1"
          :max="99"
          size="mini"
          style="width:120px;margin-left:10px;"
        ></el-input-number>
      </div>
      <div style="margin-top:20px;">
        <span>标签</span>
        <el-input
          v-model="newWatchRange.msg"
          placeholder="请输入标签"
          style="width:200px;margin-left:22px;"
        ></el-input>
      </div>
      <div style="position:relative;height:30px;margin-top:20px;">
        <el-button type="success" style="float:right;" size="mini" @click="addWatchRange">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import WatchRange from "./zyqkComponent.vue";
import GB from "@/global.vue";
import { getYP, getZyqk } from "@/api/api";

export default {
  data() {
    return {
      timer: null, //定时器
      timeCounter: 0,
      progressVal: 0,
      disSwitch: false, //图表or文字显示
      activeNames: ["1"], //航次列表活动项,
      yps: [], //预排信息
      ypIndex: "",
      vscd: "",
      imvsvy: "",
      exvsvy: "",
      curIndex: 0,
      newDialogVisible: false,
      newWatchRange: {
        msg: "", //range的备注
        bgBay: 0,
        edBay: 0
      },
      //watchVoyage -> {vscd:"",imvsvy:"",exvsvy:"",voy:"",watchRanges:[]}
      //watchRange -> {bgBay:0,edBay:0,watchAreas:[]} //块区域
      //watchArea -> {}
      watchVoyages: [] //监控航次列表
    };
  },
  methods: {
    //显示差额
    showCe(val){
      if (val == 0){
        return {color:"#20a0ff"}
      }else{
        return {color:"red"}
      }
    },
    //刷新现有区块数据,没有区块加减
    loadData() {
      let me = this;
      me.watchVoyages.forEach(function(voy) {
        //航次的选择区间
        let baySels = [];
        voy.watchRanges.forEach(function(wr) {
          baySels.push({
            msg: wr.msg,
            bgBay: wr.bgBay,
            edBay: wr.edBay
          });
        });
        getZyqk({
          vscd: voy.vscd,
          imvsvy: voy.imvsvy,
          exvsvy: voy.exvsvy,
          baySels
        }).then(res => {
          let { flag, data, errMsg, outMsg } = res;
          if (flag) {
            voy.jz2 = GB.formatWidth(data.jz2, 5);
            voy.sz2 = GB.formatWidth(data.sz2, 5);
            voy.zce2 = GB.formatWidth(data.zce2, 5);
            voy.jx2 = GB.formatWidth(data.jx2, 5);
            voy.sx2 = GB.formatWidth(data.sx2, 5);
            voy.xce2 = GB.formatWidth(data.xce2, 5);
            voy.jz4 = GB.formatWidth(data.jz4, 5);
            voy.sz4 = GB.formatWidth(data.sz4, 5);
            voy.zce4 = GB.formatWidth(data.zce4, 5);
            voy.jx4 = GB.formatWidth(data.jx4, 5);
            voy.sx4 = GB.formatWidth(data.sx4, 5);
            voy.xce4 = GB.formatWidth(data.xce4, 5);
            voy.watchRanges = data.watchRanges;
          } else {
            me.myloading = false;
            me.$message({
              message: errMsg,
              type: "error"
            });
          }
        });
      });
    },
    chgUpper() {
      this.vscd = this.vscd.toUpperCase();
    },
    vscdChg(index) {
      let yp = this.yps[index];
      this.vscd = yp.vscd;
      this.imvsvy = yp.vsvyim;
      this.exvsvy = yp.vsvyex;
    },
    addVoyage() {
      let me = this;
      if (
        GB.isEmpty(me.vscd) ||
        GB.isEmpty(me.imvsvy) ||
        GB.isEmpty(me.exvsvy)
      ) {
        me.$message({
          message: "请先输入船舶代码和船名航次",
          type: "error"
        });
        return;
      }
      let newVoy = me.vscd + " - " + me.imvsvy + " / " + me.exvsvy;
      let isFound = false;
      me.watchVoyages.forEach(function(voyage) {
        if (newVoy == voyage.voy) {
          isFound = true;
        }
      });
      if (isFound) {
        me.$message({
          message: "监控列表中已有该船名航次",
          type: "error"
        });
        return;
      }
      me.watchVoyages.push({
        vscd: me.vscd,
        imvsvy: me.imvsvy,
        exvsvy: me.exvsvy,
        voy: newVoy,
        watchRanges: []
      });
    },
    openNewDialog(index) {
      this.newDialogVisible = true;
      this.curIndex = index;
    },
    addWatchRange() {
      let me = this;
      me.watchVoyages[me.curIndex].watchRanges.push({
        msg: me.newWatchRange.msg,
        bgBay: me.newWatchRange.bgBay,
        edBay: me.newWatchRange.edBay
      });
      me.newDialogVisible = false;
    },
    delWatchRange(voyage, index) {
      let v = voyage.watchRanges[index];
      voyage.watchRanges = voyage.watchRanges.filter(function(watchRange) {
        if (watchRange !== v) {
          return watchRange;
        }
      });
    },
    delWatchVoyage(voy) {
      let me = this;
      me.$confirm("此操作将删除该航次监控, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          me.watchVoyages = me.watchVoyages.filter(function(voyage) {
            if (voy != voyage.voy) {
              return voyage;
            }
          });
          me.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          me.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  },
  components: {
    WatchRange
  },
  mounted() {
    let me = this;
    //1.航次下拉数据
    getYP({ date: GB.dateToInt(new Date()) }).then(res => {
      let { flag, data, errMsg, outMsg } = res;
      if (flag) {
        me.yps = data;
      } else {
        me.myloading = false;
        this.$message({
          message: errMsg,
          type: "error"
        });
      }
    });
    //2.定时器
    if (me.timer) {
      clearInterval(me.timer);
    } else {
      me.timer = setInterval(() => {
        me.progressVal = me.timeCounter * 10;
        if (me.timeCounter >= 10) {
          me.loadData();
          me.timeCounter = 0;
        }
        me.timeCounter++;
      }, 1000);
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
};
</script>

<style scoped>
.header {
  line-height: 50px;
  height: 50px;
  overflow: hidden;
  background: #f5f7fa;
  padding-right: 50px;
  padding-left: 20px;
  position: relative;
}
.content {
  margin-top: 10px;
  padding: 10px;
}
.voyage {
  margin-top: 0px;
}
table {
  border-collapse: collapse;
}
th,
td {
  width: 30px;
  height: 15px;
  padding: 0;
  border: 1px dashed #20a0ff;
  font: 10px "微软雅黑";
  color: #20a0ff;
  text-align: center;
}
</style>

