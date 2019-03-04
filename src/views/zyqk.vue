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
        v-model="newWatchArea.imvsvy"
        size="small"
        placeholder="进口航次"
        style="margin-left:3px;width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <el-input
        v-model="newWatchArea.exvsvy"
        size="small"
        placeholder="出口航次"
        style="margin-left:3px;width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <el-input-number
        v-model="newWatchArea.bgBay"
        controls-position="right"
        :min="1"
        :max="newWatchArea.maxBay"
        size="small"
        style="width:100px;"
      ></el-input-number>
      <el-input-number
        v-model="newWatchArea.edBay"
        controls-position="right"
        :min="1"
        :max="newWatchArea.maxBay"
        size="small"
        style="width:100px;"
      ></el-input-number>
      <el-button
        type="primary"
        plain
        size="small"
        style="margin-left:10px;"
        @click="addWatchArea"
      >添加</el-button>
    </div>
    <div class="content">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="(voyage,index) in watchVoyages"
          :key="index"
          :title="voyage.voy"
          :name="index"
        >
          <div class="voyage">
            <WatchArea
              v-for="(wa,index) in voyage.watchAreas"
              :key="index"
              style="display:inline-block;margin-left:5px;"
            ></WatchArea>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import WatchArea from "./zyqkComponent.vue";
import GB from "../global.vue";
import { getYP } from "../api/api";

export default {
  data() {
    return {
      activeNames: ["1"],
      yps: [], //预排信息
      ypIndex: "", //
      newWatchArea: {
        vscd: "",
        imvsvy: "",
        exvsvy: "",
        bgBay: 0,
        edBay: 0
      },
      //watchVoyages -> {vscd:"",imvsvy:"",exvsvy:"",maxBay: 10,voy:"",watchAreas:[]}
      //watchAreas -> {vscd:"",imvsvy:"",exvsvy:"",voy:"",bgBay:0,edBay:0}
      watchVoyages: [] //监控航次列表
    };
  },
  methods: {
    chgUpper() {
      this.vscd = this.vscd.toUpperCase();
    },
    vscdChg(index) {
      let yp = this.yps[index];
      this.newWatchArea.vscd = yp.vscd;
      this.newWatchArea.imvsvy = yp.vsvyim;
      this.newWatchArea.exvsvy = yp.vsvyex;
      this.newWatchArea.maxBay = 100;
    },
    addWatchArea() {
      let me = this;
      if (
        GB.isEmpty(me.newWatchArea.vscd) ||
        GB.isEmpty(me.newWatchArea.imvsvy) ||
        GB.isEmpty(me.newWatchArea.exvsvy)
      ) {
        this.$message({
          message: "请先输入船舶代码和船名航次",
          type: "error"
        });
        return;
      }
      let newVoy =
        me.newWatchArea.vscd +
        " - " +
        me.newWatchArea.imvsvy +
        " / " +
        me.newWatchArea.exvsvy;
      let isFound = false;
      me.watchVoyages.forEach(function(voyage) {
        if (newVoy == voyage.voy) {
          voyage.watchAreas.push(me.newWatchArea);
          isFound = true;
        }
      });
      if (!isFound) {
        me.watchVoyages.push({
          vscd: me.newWatchArea.vscd,
          imvsvy: me.newWatchArea.imvsvy,
          exvsvy: me.newWatchArea.exvsvy,
          voy: newVoy,
          maxBay: 100,
          watchAreas: [me.newWatchArea]
        });
      }
    }
  },
  components: {
    WatchArea
  },
  mounted() {
    let me = this;
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
</style>

