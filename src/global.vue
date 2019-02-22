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

export default {
  srvurl,
  trim,
  isEmpty,
  pad2,
  ipad2,
  downloadURI
};
</script>
