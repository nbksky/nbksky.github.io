function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽을 수 없습니다."));
    };
    img.src = url;
  });
}

// Firestore 문서 1MB 제한 때문에 해상도/품질을 낮춰 용량(바이트) 이하로 맞춘다.
// aspect(가로/세로)를 주면 그 비율로 중앙 크롭한다 (서브 비주얼 배너용).
export async function resizeImage(file, { maxWidth = 1200, maxBytes = 200 * 1024, aspect } = {}) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const img = await loadImage(file);

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (aspect) {
    if (img.width / img.height > aspect) {
      sw = Math.round(img.height * aspect);
      sx = Math.round((img.width - sw) / 2);
    } else {
      sh = Math.round(img.width / aspect);
      sy = Math.round((img.height - sh) / 2);
    }
  }

  let width = Math.min(sw, maxWidth);
  let quality = 0.85;

  for (let i = 0; i < 12; i++) {
    const height = Math.round((sh * width) / sw);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    // base64 문자열 길이 → 실제 바이트 근사
    const bytes = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
    if (bytes <= maxBytes) return dataUrl;

    if (quality > 0.55) quality -= 0.1;
    else width = Math.round(width * 0.85);
  }

  throw new Error("이미지 용량을 충분히 줄이지 못했습니다. 더 작은 이미지를 사용해주세요.");
}
