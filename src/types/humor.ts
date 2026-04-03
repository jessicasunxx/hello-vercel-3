export type HumorFlavor = {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HumorFlavorStep = {
  id: string;
  flavor_id: string;
  position: number;
  title: string | null;
  prompt: string;
  created_at: string;
};

export type HumorCaptionRun = {
  id: string;
  flavor_id: string | null;
  image_url: string;
  captions_text: string | null;
  error: string | null;
  created_at: string;
};
