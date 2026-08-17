import '@testing-library/jest-dom';

// Polyfills and mocks for DOM & canvas environment in tests
class MockMediaRecorder {
  state = 'inactive';
  mimeType = 'video/webm';
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;

  static isTypeSupported(mime: string) {
    return true;
  }

  constructor(public stream?: any, public options?: any) {
    if (options?.mimeType) {
      this.mimeType = options.mimeType;
    }
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['mock-video-data'], { type: 'video/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
}

// @ts-ignore
window.MediaRecorder = MockMediaRecorder;

// Mock HTMLCanvasElement.prototype.captureStream
if (!HTMLCanvasElement.prototype.captureStream) {
  // @ts-ignore
  HTMLCanvasElement.prototype.captureStream = function() {
    return {} as MediaStream;
  };
}

// Mock URL.createObjectURL and URL.revokeObjectURL
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => 'blob:http://localhost/mock-blob-url';
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = () => {};
}
