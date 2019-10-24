<template>
  <div>
    <div>
      <span>冲突贝位差设置：</span>
      <el-input-number
        v-model="curConflict.conflict_bay_num"
        size="mini"
        :min="1"
        style="width:100px;"
      ></el-input-number>
    </div>
    <div style="margin-top:20px;">
      <span>冲突时间范围设置：</span>
      <el-input-number v-model="curConflict.conflict_min" size="mini" :min="1" style="width:100px;"></el-input-number>
    </div>
    <div style="margin-top:20px;overflow:hidden;">
      <span style="float:left;margin-top:3px;">轻度冲突数量设置：</span>
      <el-input-number
        v-model="curConflict.low_num"
        size="mini"
        :min="1"
        style="width:100px;float:left;margin-left:5px;"
      ></el-input-number>
      <el-color-picker
        v-model="curConflict.low_color"
        size="mini"
        style="float:left;margin-left:5px;"
      ></el-color-picker>
      <span style="float:left;margin-top:3px;margin-left:10px;">*小于等于此数量视作轻度冲突。</span>
    </div>
    <div style="margin-top:20px;overflow:hidden;">
      <span style="float:left;margin-top:3px;">中等冲突数量设置：</span>
      <el-input-number
        v-model="curConflict.mid_num"
        size="mini"
        :min="1"
        style="width:100px;float:left;margin-left:5px;"
      ></el-input-number>
      <el-color-picker
        v-model="curConflict.mid_color"
        size="mini"
        style="float:left;margin-left:5px;"
      ></el-color-picker>
      <span style="float:left;margin-top:3px;margin-left:10px;">*小于等于此数量视作中等冲突，大于此数量视作强烈冲突。</span>
    </div>
    <div style="margin-top:20px;overflow:hidden;">
      <span style="float:left;margin-top:3px;">强烈冲突设置：</span>
      <el-color-picker
        v-model="curConflict.high_color"
        size="mini"
        style="float:left;margin-left:5px;"
      ></el-color-picker>
    </div>
    <div style="overflow:hidden;">
      <el-button
        size="small"
        @click="conflictOk"
        style="float:right;margin-right:10px;margin-top:10px;"
      >确定</el-button>
      <el-button
        size="small"
        @click="conflictCancel"
        style="float:right;margin-right:10px;margin-top:10px;"
      >取消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      curConflict: ""
    };
  },
  props: {
    conflict: ""
  },
  watch: {
    conflict: {
      handler(newConflict, oldValue) {
        let me = this;
        me.curConflict = newConflict;
      },
      immediate: true
    }
  },
  methods: {
    conflictOk() {
      localStorage.setItem("conflict", JSON.stringify(this.curConflict));
      this.$emit("conflictChange", this.curConflict);
    },
    conflictCancel() {
      this.$emit("conflictChange", null);
    }
  }
};
</script>

<style scoped>
</style>