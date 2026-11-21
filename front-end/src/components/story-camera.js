// Match the mask's aspect ratio, then keep the visible window inside the image.
// The authored rectangle may extend past an edge to position its focal point.
export function fitCameraToImage(camera, image, viewport) {
  const ratio = viewport.width / viewport.height;
  const width = Math.min(camera.width, camera.height * ratio, image.width, image.height * ratio);
  const height = width / ratio;
  const centerX = camera.x + camera.width / 2;
  const centerY = camera.y + camera.height / 2;

  return {
    x: Math.max(0, Math.min(centerX - width / 2, image.width - width)),
    y: Math.max(0, Math.min(centerY - height / 2, image.height - height)),
    width,
    height,
  };
}
