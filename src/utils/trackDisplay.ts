/** Strip common audio file extensions for clean titles in the UI. */
const AUDIO_EXTENSION = /\.(mp3|flac|m4a|wav|aac|ogg|opus|aiff|wma)$/i

/** Remove leading track index prefixes: "01 - ", "01. ", "12 – ", etc. */
const LEADING_INDEX = /^\s*\d+(\s*[-–—.]\s*|\.\s+)/

export function stripAudioExtension(filename: string): string {
  return filename.replace(AUDIO_EXTENSION, '')
}

export function stripLeadingTrackIndex(name: string): string {
  let s = name.trim()
  for (let i = 0; i < 5; i++) {
    const next = s.replace(LEADING_INDEX, '').trim()
    if (next === s) {
      break
    }
    s = next
  }
  return s
}

/** Title shown in lists and mini-player: no extension, no leading index. */
export function cleanTrackTitleForDisplay(filename: string): string {
  return stripLeadingTrackIndex(stripAudioExtension(filename))
}
