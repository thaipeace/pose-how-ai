import { create } from 'zustand';

interface PoseState {
    generatedImage: string | null;
    isGeneratingPose: boolean;
    setGeneratedImage: (url: string | null) => void;
    setIsGeneratingPose: (isGenerating: boolean) => void;
}

export const usePoseStore = create<PoseState>((set) => ({
    generatedImage: null,
    isGeneratingPose: false,
    setGeneratedImage: (url) => set({ generatedImage: url }),
    setIsGeneratingPose: (isGenerating) => set({ isGeneratingPose: isGenerating }),
}));
