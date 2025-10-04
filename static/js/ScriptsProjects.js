const { createApp, ref, onMounted, onBeforeUnmount } = Vue;

createApp({
  setup() {
    const canvasRef = ref(null);
    const imageRef = ref(null);
    const sidebarOpen = ref(true);
    const active = ref(null);
    const scale = ref(1);
    const offset = ref({ x: 0, y: 0 });
    let initialScale = 1;
    let initialOffset = { x: 0, y: 0 };

    const windows = ref([]);

 

    function vertexToPixel(v, img) {
      return {
        x: v.xRatio * img.width * scale.value + offset.value.x,
        y: v.yRatio * img.height * scale.value + offset.value.y,
      };
    }
   const apartments = ref([]);



    function draw() {
      const canvas = canvasRef.value;
      const ctx = canvas.getContext("2d");
      const img = imageRef.value;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        offset.value.x,
        offset.value.y,
        img.width * scale.value,
        img.height * scale.value
      );

      const drawVertices = (vertices) => {
        if (!vertices.length) return;
        ctx.beginPath();
        const first = vertexToPixel(vertices[0], img);
        ctx.moveTo(first.x, first.y);
        vertices.forEach((v) => {
          const p = vertexToPixel(v, img);
          ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 123, 255, 0.25)";
        ctx.strokeStyle = "var(--accent-color-neon-pink)";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      };
      windows.value.forEach((win) => drawVertices(win.vertices));
    }

    function isPointInPolygon(x, y, vertices, img) {
      let inside = false;
      for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].xRatio * img.width * scale.value + offset.value.x;
        const yi = vertices[i].yRatio * img.height * scale.value + offset.value.y;
        const xj = vertices[j].xRatio * img.width * scale.value + offset.value.x;
        const yj = vertices[j].yRatio * img.height * scale.value + offset.value.y;
        const intersect =
          yi > y !== yj > y &&
          x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }

function handleClick(event) {
  const rect = canvasRef.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const img = imageRef.value;

  for (let win of windows.value) {
    if (isPointInPolygon(mouseX, mouseY, win.vertices, img)) {
      // البحث عن الشقة المرتبطة بالإحداثيات
      const apartment = apartments.value.find(
        apt => apt.id === win.apartment_id
      );

      if (apartment) {
        active.value = {
          room: `شقة رقم ${apartment.number}`,
          floor: apartment.floor,
          area: apartment.area,
          rooms: apartment.rooms,
          available: apartment.available,
          price: apartment.price,
        };
      } else {
        active.value = null;
      }
      return;
    }
  }

  active.value = null;
}

    function zoomIn() { zoomManual(1.2); }
    function zoomOut() { zoomManual(0.8); }
    function resetZoom() {
      scale.value = initialScale;
      offset.value = { ...initialOffset };
      draw();
    }
    function zoomManual(factor) {
      const canvas = canvasRef.value;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const prev = scale.value;
      scale.value *= factor;
      if (scale.value < initialScale) {
        scale.value = initialScale;
        offset.value = { ...initialOffset };
      } else {
        offset.value.x -= (cx - offset.value.x) * (scale.value / prev - 1);
        offset.value.y -= (cy - offset.value.y) * (scale.value / prev - 1);
      }
      limitOffset();
      draw();
    }

    const isDragging = ref(false);
    const dragStart = ref({ x: 0, y: 0 });
    function handleMouseDown(e) {
      isDragging.value = true;
      dragStart.value = { x: e.clientX - offset.value.x, y: e.clientY - offset.value.y };
    }
    function handleMouseMove(e) {
      if (!isDragging.value) return;
      offset.value.x = e.clientX - dragStart.value.x;
      offset.value.y = e.clientY - dragStart.value.y;
      limitOffset();
      draw();
    }
    function handleMouseUp() { isDragging.value = false; }
    function handleMouseLeave() { isDragging.value = false; }

    // 🟢 دعم السحب باللمس
    function handleTouchStart(e) {
      if (e.touches.length !== 1) return;
      isDragging.value = true;
      const t = e.touches[0];
      dragStart.value = { x: t.clientX - offset.value.x, y: t.clientY - offset.value.y };
    }
    function handleTouchMove(e) {
      if (!isDragging.value || e.touches.length !== 1) return;
      const t = e.touches[0];
      offset.value.x = t.clientX - dragStart.value.x;
      offset.value.y = t.clientY - dragStart.value.y;
      limitOffset();
      draw();
    }
    function handleTouchEnd() { isDragging.value = false; }

    function limitOffset() {
      const img = imageRef.value;
      const canvas = canvasRef.value;
      const imgW = img.width * scale.value;
      const imgH = img.height * scale.value;
      if (imgW <= canvas.width)
        offset.value.x = (canvas.width - imgW) / 2;
      else
        offset.value.x = Math.min(0, Math.max(canvas.width - imgW, offset.value.x));
      if (imgH <= canvas.height)
        offset.value.y = (canvas.height - imgH) / 2;
      else
        offset.value.y = Math.min(0, Math.max(canvas.height - imgH, offset.value.y));
    }

    function setupCanvas() {
      const canvas = canvasRef.value;
      const wrapper = canvas.parentElement;
      const img = imageRef.value;
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;
      const imgRatio = img.width / img.height;
      const wrapperRatio = wrapperWidth / wrapperHeight;

      if (imgRatio > wrapperRatio) {
        canvas.width = wrapperWidth;
        canvas.height = wrapperWidth / imgRatio;
      } else {
        canvas.height = wrapperHeight;
        canvas.width = wrapperHeight * imgRatio;
      }

      scale.value = canvas.width / img.width;
      initialScale = scale.value;
      initialOffset = {
        x: (canvas.width - img.width * scale.value) / 2,
        y: (canvas.height - img.height * scale.value) / 2,
      };
      offset.value = { ...initialOffset };
      draw();
    }

    let resizeObserver;
    onMounted(() => {
      const nodeList = document.querySelectorAll('.window'); // كل العناصر اللي فيها الإحداثيات
      windows.value = Array.from(nodeList).map(node => {
        return {
          id: Number(node.dataset.id),
          vertices: JSON.parse(node.dataset.vertices)
        };
      });

      // بعد ما نحصل على البيانات ممكن نرسم
      draw();
      const img = imageRef.value;
      if (img.complete) setupCanvas();
      else img.onload = setupCanvas;
      resizeObserver = new ResizeObserver(setupCanvas);
      resizeObserver.observe(canvasRef.value.parentElement);

       const data = JSON.parse(
    document.getElementById("apartments-data").textContent
  );
  apartments.value = data;
    });
    

    return {
      canvasRef,
      imageRef,
      sidebarOpen,
      active,
      scale,
      offset,
      windows,
      handleClick,
      zoomIn,
      zoomOut,
      resetZoom,
      zoomManual,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      apartments,
     
    };
  },
}).mount("#app");
