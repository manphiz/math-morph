/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const easeInOutCubic = (x: number): number => 
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const lerp = (a: number, b: number, t: number): number => 
  a + (b - a) * t;

export const exportWebM = async (
  canvas: HTMLCanvasElement, 
  fps: number
): Promise<{ recorder: MediaRecorder; stopped: Promise<Blob> }> => {
  const stream = canvas.captureStream(fps);
  const preferred = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  const mimeType = preferred.find(t => MediaRecorder.isTypeSupported(t)) || "";
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  
  recorder.ondataavailable = (e) => { 
    if (e.data && e.data.size > 0) chunks.push(e.data); 
  };
  
  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
  });
  
  recorder.start();
  return { recorder, stopped };
};
