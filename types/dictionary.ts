
export interface Word {
  id: string;
  word: string;
  transcription: string;
  translation: string;
  isAutoFilled: boolean;
  language: 'en' | 'ru';
}

export interface Dictionary {
  id: string;
  name: string;
  lastUpdated: Date;
  words: Word[];
}

export interface TestWord extends Word {
  questionDirection: 'en-ru' | 'ru-en';
}
