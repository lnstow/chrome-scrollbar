const ICON_SIZES = [16, 32, 48, 128];

function drawIcon(size) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);
    ctx.font = `bold ${Math.floor(size * 0.8)}px sans-serif`;
    ctx.fillStyle = "#00ffff"; // 蓝色文字
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TS", size / 2, size / 2);

    return ctx.getImageData(0, 0, size, size);
}

function buildIconImageData() {
    const imageData = {};
    for (const size of ICON_SIZES) {
        const data = drawIcon(size);
        if (data) {
            imageData[size] = data;
        }
    }
    return imageData;
}

async function setCanvasIcon() {
    const imageData = buildIconImageData();
    if (Object.keys(imageData).length === 0) return;

    try {
        await chrome.action.setIcon({ imageData });
    } catch (err) {
        console.error("Failed to set canvas icon", err);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    setCanvasIcon();
});

chrome.runtime.onStartup.addListener(() => {
    setCanvasIcon();
});

// 让 worker 启动时也尝试设置一次，避免遗漏
setCanvasIcon();

