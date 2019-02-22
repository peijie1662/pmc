<template>
  <el-form
    :model="ruleForm2"
    :rules="rules2"
    ref="ruleForm2"
    label-position="left"
    label-width="0px"
    class="demo-ruleForm login-container"
  >
    <section class="title">
      <i class="iconfont icon-icon_crab_coloured icon" style="color:#FF5500;font-size:30px;"></i>
      <h3 style="display:inline;margin-left:10px;">生产监控中心</h3>
    </section>
    <el-form-item prop="account">
      <el-input type="text" v-model="ruleForm2.userid" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input type="password" v-model="ruleForm2.password" auto-complete="off" placeholder="密码"></el-input>
    </el-form-item>
    <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
    <el-form-item style="width:100%;">
      <el-button
        type="primary"
        style="width:100%;"
        @click.native.prevent="handleSubmit2"
        :loading="logining"
      >登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { login } from "../api/api";
export default {
  data() {
    return {
      logining: false, //是否已登录
      ruleForm2: {
        userid: "",
        password: ""
      },
      rules2: {
        userid: [
          { required: true, message: "请输入用户", trigger: "blur" } //blur 触摸污染
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      checked: true
    };
  },
  methods: {
    handleSubmit2() {
      this.$refs.ruleForm2.validate(valid => {
        if (valid) {
          this.logining = true;
          this.ruleForm2.userid = this.ruleForm2.userid.toUpperCase();
          let authParams = {
            userName: this.ruleForm2.userid,
            password: this.ruleForm2.password
          };
          login(authParams).then(res => {
            this.logining = false;
            let { flag, data, errMsg, outMsg } = res;
            if (!flag) {
              this.$message({
                message: errMsg,
                type: "error"
              });
            } else {
              //保存用户和权限
              let data = {};
              data["userid"] = this.ruleForm2.userid;
              data["password"] = this.ruleForm2.password;
              sessionStorage.setItem("userinfo", JSON.stringify(data));
              this.$router.push({ path: "/home" });
            }
          });
        } else {
          this.$message({
            message: "提交到服务器时出错,网络或服务器故障",
            type: "error"
          });
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  .remember {
    margin: 0px 0px 35px 0px;
  }
}
</style>