<script>
const srvurl = "http://169.169.43.56:8003";

function isEmpty(obj) {
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}

function trim(val){
　　return val.replace(/(^\s*)|(\s*$)/g, "");
}

// 数字转字符前补0
function pad(num, n) {
	num = String(num);
	var len = String(num).length;
	while (len < n) {
		num = "0" + num;
		len++;
	}
	return num;
}

function pad2(str) {
  str = str.trim();
  if (str.length == 1) {
    str = "0" + str;
  } else if (str.length == 0) {
    str = "00";
  }
  return str;
}

function ipad2(i) {
  let str = i.toString();
  if (str.length == 1) {
    str = "0" + str;
  } else if (str.length == 0) {
    str = "00";
  }
  return str;
}

function downloadURI(uri, name) {
  let link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function dateToInt(date) {
  let Y = date.getFullYear() + "";
  let M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "";
  let D = pad2(date.getDate() + "");
  return parseInt(Y + M + D);
}

function intToDate(dint) {
  let ds = dint + "";
  let d = new Date(
    ds.substr(0, 4) + "-" + ds.substr(4, 2) + "-" + ds.substr(6, 2)
  );
  return d;
}

//日期加减
function addDate(date, days) {
	var d = new Date(date);
	d.setDate(d.getDate() + days);
	var m = d.getMonth() + 1;
	return d.getFullYear() + '-' + m + '-' + d.getDate();
}

// 小时加减 
function addHour(date, hours) {
	var d = new Date(date);
	d.setHours(d.getHours() + hours);
	var m = d.getMonth() + 1;
	return m + '/' + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
}

// 将2个数字转为字符串20170101,0800 -> 20170101080000
function dateToStr(date, time) {
	var timeStr = pad(time, 4) + '00';
	return String(date) + timeStr;
}

// 将2个数字转为字符串 20170101,0800 -> date
function convertNumToDate(date, time) {
	var pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
	var str = dateToStr(date, time);
	return str.replace(pattern, '$1/$2/$3 $4:$5:$6');
}

// 求时间差(分钟)
function vesselMin(bgDate, bgTime, edDate, edTime) {
	var pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
	var bgStr = dateToStr(bgDate, bgTime);
	var bd = bgStr.replace(pattern, '$1/$2/$3 $4:$5:$6');
	bd = new Date(bd);
	var edStr = dateToStr(edDate, edTime);
	var ed = edStr.replace(pattern, '$1/$2/$3 $4:$5:$6');
	ed = new Date(ed);
	return (ed - bd) / 1000 / 60;
}

// 将数字表示日期时间转为字符串 1月1日 12:12
function convertDHM(date, time) {
	var pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
	var str = dateToStr(date, time);
	return str.replace(pattern, '$2/$3 $4:$5');
}

// "2017-01-01"->"20170101"
function getCompackDateStr(str) {
	var pattern = /(\d{4})-(\d{2})-(\d{2})/;
	return str.replace(pattern, '$1$2$3');
}

function formatDate(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
}

export default {
  srvurl,
  trim,
  isEmpty,
  pad,
  pad2,
  ipad2,
  downloadURI,
  addHour,
  addDate,
  dateToStr,
  convertNumToDate,
  vesselMin,
  convertDHM,
  getCompackDateStr,
  dateToInt,
  intToDate,
  formatDate
};
</script>
