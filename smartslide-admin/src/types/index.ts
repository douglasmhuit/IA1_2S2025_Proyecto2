export interface SystemStatus {
  Status: 'stopped' | 'running' | 'paused';
  StartedAt: string;
  LastSlideAt: string;
  SlidesCaptured: number;
  LastError: string;
}

export interface Config {
  camera_index: number;
  capture_fps: number;
  sensitivity: number;
  min_seconds_between_slides: number;
  telegram_bot_token: string;
  telegram_chat_id: string;
  tesseract_lang: string;
  output_dir: string;
  enable_annotation: boolean;
  max_caption_chars: number;
  admin_http_addr: string;
}

export interface Metrics {
  ocr_accuracy: number;
  processing_time: number;
  telegram_success_rate: number;
  avg_change_score: number;
  total_slides: number;
  last_hour_slides: number;
}

export interface ControlResponse {
  ok: boolean;
  message?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
}

export interface MetricsData {
  ocr_accuracy: number;
  processing_time: number;
  telegram_success_rate: number;
  avg_change_score: number;
  total_slides: number;
  last_hour_slides: number;
}