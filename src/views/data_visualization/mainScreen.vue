<template>
  <div>
    <v-stage
      ref="stage"
      :config="configKonva"
      @dragstart="handleDragstart"
      @dragend="handleDragend"
    >
      <v-layer ref="layer">
        <v-star
          v-for="item in list"
          :key="item.id"
          :config="{
            x: item.x,
            y: item.y,
            rotation: item.rotation,
            id: item.id,
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 50, fill: item.color,
            opacity: 0.8,
            draggable: true,
            scaleX: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            scaleY: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffsetX: dragItemId === item.id ? 15 : 5,
            shadowOffsetY: dragItemId === item.id ? 15 : 5,
            shadowOpacity: 0.6
          }"
        ></v-star>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import GB from "@/global.vue";

const width = window.innerWidth;
const height = window.innerHeight;
export default {
  data() {
    return {
      list: [],
      dragItemId: null,
      configKonva: {
        width: width,
        height: height
      }
    };
  },
  methods: {
    refreshData() {
      let me = this;
      me.list = me.list.map(item => {
        item.rotation = item.rotation +  10;
        return item;
      });
      if (me.list.length <= 100) {
        me.list.push({
          id: Math.round(Math.random() * 100000).toString(),
          x: Math.random() * width,
          y: Math.random() * height,
          rotation: Math.random() * 180,
          scale: Math.random(),
          color: GB.randomColor()
        });
      }
    },
    handleDragstart(e) {
      // save drag element:
      this.dragItemId = e.target.id();
      // move current element to the top:
      const item = this.list.find(i => i.id === this.dragItemId);
      const index = this.list.indexOf(item);
      this.list.splice(index, 1);
      this.list.push(item);
    },
    handleDragend(e) {
      this.dragItemId = null;
    }
  },
  mounted() {
    let me = this;
    for (let n = 0; n < 10; n++) {
      me.list.push({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.random() * width,
        y: Math.random() * height,
        rotation: Math.random() * 180,
        scale: Math.random(),
        color: GB.randomColor()
      });
    }
    //2.定时器
    if (me.timer) {
      clearInterval(me.timer);
    } else {
      me.timer = setInterval(() => {
        me.refreshData();
      }, 200);
    }
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>