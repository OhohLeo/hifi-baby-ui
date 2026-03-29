/**
 * File system service abstraction
 * Provides unified file picking interface for web and native platforms
 */
import { Capacitor } from '@capacitor/core'
import { FilePicker } from '@capawesome/capacitor-file-picker'

interface FilePickerResult {
  file: File | null
  path?: string
  name: string
  mimeType: string
  size: number
  data?: string // base64 data for native
}

class FileSystemService {
  /**
   * Pick an audio file using platform-appropriate picker
   */
  async pickAudioFile(): Promise<FilePickerResult | null> {
    const platform = Capacitor.getPlatform()

    if (platform === 'web') {
      return this.webFilePicker()
    } else {
      return this.nativeFilePicker()
    }
  }

  /**
   * Web file picker using HTML5 input
   */
  private async webFilePicker(): Promise<FilePickerResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac'

      input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
          resolve({
            file,
            name: file.name,
            mimeType: file.type,
            size: file.size
          })
        } else {
          resolve(null)
        }
      }

      input.oncancel = () => {
        resolve(null)
      }

      input.click()
    })
  }

  /**
   * Native file picker using Capacitor plugin
   */
  private async nativeFilePicker(): Promise<FilePickerResult | null> {
    try {
      const result = await FilePicker.pickFiles({
        types: ['audio/*'],
        readData: true // Get base64 data for upload
      })

      if (result.files && result.files.length > 0) {
        const pickedFile = result.files[0]

        // Convert base64 to Blob, then to File for consistency with web API
        const blob = this.base64ToBlob(pickedFile.data!, pickedFile.mimeType)
        const file = new File([blob], pickedFile.name, { type: pickedFile.mimeType })

        return {
          file,
          path: pickedFile.path,
          name: pickedFile.name,
          mimeType: pickedFile.mimeType,
          size: pickedFile.size || blob.size,
          data: pickedFile.data
        }
      }

      return null
    } catch (error) {
      console.error('Native file picker failed:', error)
      return null
    }
  }

  /**
   * Convert base64 string to Blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    return ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']
  }

  /**
   * Validate file is audio
   */
  isAudioFile(file: File): boolean {
    const audioMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/m4a',
      'audio/aac',
      'audio/x-m4a'
    ]

    return audioMimeTypes.some(type => file.type.includes(type)) ||
           this.getSupportedFormats().some(ext => file.name.toLowerCase().endsWith(ext))
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) {
return '0 Bytes'
}

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }
}

export const fileSystemService = new FileSystemService()
