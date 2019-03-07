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
        v-model="newWatchRange.imvsvy"
        size="small"
        placeholder="进口航次"
        style="margin-left:3px;width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <el-input
        v-model="newWatchRange.exvsvy"
        size="small"
        placeholder="出口航次"
        style="margin-left:3px;width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <el-input-number
        v-model="newWatchRange.bgBay"
        controls-position="right"
        :min="1"
        :max="newWatchRange.maxBay"
        size="small"
        style="width:100px;"
      ></el-input-number>
      <el-input-number
        v-model="newWatchRange.edBay"
        controls-position="right"
        :min="1"
        :max="newWatchRange.maxBay"
        size="small"
        style="width:100px;"
      ></el-input-number>
      <el-button
        type="primary"
        plain
        size="small"
        style="margin-left:10px;"
        @click="addWatchRange"
      >添加</el-button>

      <el-switch
        v-model="disSwitch"
        active-text="图表显示"
        inactive-text="文字显示"
        style="margin-left:10px;"
      ></el-switch>

      <el-button type="primary" plain size="small" style="margin-left:10px;" @click="loadData">test</el-button>
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
            <WatchRange
              v-for="(wr,index) in voyage.watchRanges"
              :key="index"
              style="display:inline-block;margin-left:15px;"
              :watchRange="wr"
              :disSwitch="disSwitch"
            ></WatchRange>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import WatchRange from "./zyqkComponent.vue";
import GB from "../global.vue";
import { getYP, getZyqk } from "../api/api";

export default {
  data() {
    return {
      disSwitch: false, //图表or文字显示
      activeNames: ["1"],
      yps: [], //预排信息
      ypIndex: "", //
      newWatchRange: {
        vscd: "",
        imvsvy: "",
        exvsvy: "",
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
    //刷新现有区块数据,没有区块加减
    loadData() {
      let me = this;
      me.watchVoyages.forEach(function(voy) {
        //航次的选择区间
        let baySels = [];
        voy.watchRanges.forEach(function(wr) {
          baySels.push({
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
            voy.watchRanges = data;
            console.log(voy.voy);
            voy.watchRanges.forEach(function(wr) {
              console.log(wr.bgBay + "-" + wr.edBay);
            });
          } else {
            me.myloading = false;
            this.$message({
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
      this.newWatchRange.vscd = yp.vscd;
      this.newWatchRange.imvsvy = yp.vsvyim;
      this.newWatchRange.exvsvy = yp.vsvyex;
      this.newWatchRange.maxBay = 100;
    },
    addWatchRange() {
      let me = this;
      if (
        GB.isEmpty(me.newWatchRange.vscd) ||
        GB.isEmpty(me.newWatchRange.imvsvy) ||
        GB.isEmpty(me.newWatchRange.exvsvy)
      ) {
        this.$message({
          message: "请先输入船舶代码和船名航次",
          type: "error"
        });
        return;
      }
      let newVoy =
        me.newWatchRange.vscd +
        " - " +
        me.newWatchRange.imvsvy +
        " / " +
        me.newWatchRange.exvsvy;
      let isFound = false;
      //如果有该航次,添加监视区
      me.watchVoyages.forEach(function(voyage) {
        if (newVoy == voyage.voy) {
          voyage.watchRanges.push({
            bgBay: me.newWatchRange.bgBay,
            edBay: me.newWatchRange.edBay
          });
          isFound = true;
        }
      });
      //如果没有该航次,创建航次,并添加监视区
      if (!isFound) {
        me.watchVoyages.push({
          vscd: me.newWatchRange.vscd,
          imvsvy: me.newWatchRange.imvsvy,
          exvsvy: me.newWatchRange.exvsvy,
          voy: newVoy,
          watchRanges: [
            {
              bgBay: me.newWatchRange.bgBay,
              edBay: me.newWatchRange.edBay
            }
          ]
        });
      }
    }
  },
  components: {
    WatchRange
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

