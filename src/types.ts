export interface GeneratedGraphic {
  svg: string;
  title: string;
  tags: string[];
  styleDescription: string;
  color: string;
  prompt: string;
  createdAt: number;
}

export interface GenerateResponse {
  graphic: GeneratedGraphic;
}

export interface AIPayload {
  prompt: string;
  color: string;
  styleDirectives: string[];
  mood: string;
  targetFormat: "svg" | "png";
}
