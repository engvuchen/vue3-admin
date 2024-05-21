import { ref } from 'vue';

export const useScrollbar = (tagsItem, scrollContainer) => {
  const scrollLeft = ref(0);

  const doScroll = (val) => {
    scrollLeft.value = val;
    scrollContainer.value.setScrollLeft(scrollLeft.value);
  };

  // 用途不明；实际不需要自定义滚动时间，用浏览器的 scroll 事件就行；
  const handleScroll = (e) => {
    const $wrap = scrollContainer.value.wrapRef;
    if (!$wrap) return;

    if ($wrap.offsetWidth + scrollLeft.value > $wrap?.children?.[0]?.scrollWidth) {
      doScroll($wrap.children[0].scrollWidth - $wrap.offsetWidth);
      return;
    } else if (scrollLeft.value < 0) {
      doScroll(0);
      return;
    }
    const eventDelta = e.wheelDelta || -e.deltaY;
    doScroll(scrollLeft.value - eventDelta / 4);
  };
  const moveToTarget = (currentTag) => {
    const $wrap = scrollContainer.value.wrapRef;
    if (!$wrap) return;

    let firstTag = null;
    let lastTag = null;
    let tagList = tagsItem;
    if (tagList.length > 0) {
      firstTag = tagList[0];
      lastTag = tagList[tagList.length - 1];
    }
    if (firstTag === currentTag) {
      // 第一个标签
      doScroll(0);
    } else if (lastTag === currentTag) {
      // 最后一个标签

      // 715, 602 children[0] 刚好下一层容器，但自己和下一层容器的宽度是一样的
      // doScroll($wrap.children[0].scrollWidth - $wrap.offsetWidth);
      // $wrap.offsetWidth + 溢出可视区域宽度 = $wrap.scrollWidth
      doScroll($wrap.scrollWidth - $wrap.offsetWidth);
    } else {
      const el = currentTag.$el.nextElementSibling; // ？为什么是下一个节点
      console.log('🔎 ~ moveToTarget ~ currentTag.$el:', currentTag.$el);

      /**
       * el.offsetLeft 是当前元素左边界距离最近的具有定位（position不是static）的父元素的左边界的距离。
       * el.offsetWidth 是当前元素的宽度，包括内边距（padding）、边框（border）但不包括外边距（margin）。
       * $wrap.offsetWidth 是包裹容器的宽度（包括边框但不包括外边距）。
       */

      // 下一个节点是否移出容器可视宽度 ? 滚动条滚动 : 滚动条不滚动
      // el.offsetLeft - el.offsetWidth（看成是前一个节点就行了），刚好是前一个节点的 offsetLeft。todo 这里的 3 种情况可以优化成一种情况

      el.offsetLeft + el.offsetWidth > $wrap.offsetWidth ? doScroll(el.offsetLeft - el.offsetWidth) : doScroll(0);
    }
  };

  return {
    // scrollContainer,
    handleScroll,
    moveToTarget,
  };
};
