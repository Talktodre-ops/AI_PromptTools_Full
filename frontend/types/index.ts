export interface PromptFormProps {
  onResults: (results: string[]) => void;
}

export interface PromptResultsProps {
  results: string[];
}

export interface WelcomePageProps {
  onStart: () => void;
}