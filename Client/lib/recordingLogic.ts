interface Transcripts {
  [key: string]: string;
}

export const calculateOrderedTranscript = (transcripts: Transcripts): string => {
  return Object.keys(transcripts)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => transcripts[k])
    .join(' ');
};
