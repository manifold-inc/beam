'use client'
import { uploadFiles } from '@/server/uploadthing'
import {toast} from 'sonner'
import { Cursor } from 'textarea-markdown-editor'

function replacePlaceholder(
  cursor: Cursor,
  placeholder: string,
  replaceWith: string
) {
  cursor.setValue(cursor.value.replace(placeholder, replaceWith))
}

export async function uploadImageCommandHandler(
  textareaEl: HTMLTextAreaElement,
  files: File[]
) {
  const cursor = new Cursor(textareaEl)
  const currentLineNumber = cursor.position.line

  for(const file of files){
    const placeholder = `![Uploading ${file.name}...]()`

    cursor.replaceLine(currentLineNumber.lineNumber, placeholder)

    try {
      const [uploadedImage] = await uploadFiles('postImage',{files: [file]})

      replacePlaceholder(
        cursor,
        placeholder,
        `<img width="auto" alt="${uploadedImage.name}" src="${uploadedImage.url}">`
      )
    } catch (error: unknown) {
      console.log(error)
      replacePlaceholder(cursor, placeholder, '')
      toast.error(`Error uploading image: ${(error as {message: string}).message}`)
    }
    
  }
}

export function getSuggestionData(textareaEl: HTMLTextAreaElement): {
  keystrokeTriggered: boolean
  triggerIdx: number
  type: 'mention' | 'emoji'
  query: string
} {
  const positionIndex = textareaEl.selectionStart
  const textBeforeCaret = textareaEl.value.slice(0, positionIndex)

  const tokens = textBeforeCaret.split(/\s/)
  const lastToken = tokens[tokens.length - 1]

  const triggerIdx = textBeforeCaret.endsWith(lastToken)
    ? textBeforeCaret.length - lastToken.length
    : -1

  const maybeTrigger = textBeforeCaret[triggerIdx]
  const mentionKeystrokeTriggered = maybeTrigger === '@'
  const emojiKeystrokeTriggered = maybeTrigger === ':'
  const keystrokeTriggered =
    mentionKeystrokeTriggered || emojiKeystrokeTriggered
  const type = mentionKeystrokeTriggered ? 'mention' : 'emoji'

  const query = textBeforeCaret.slice(triggerIdx + 1)

  return {
    keystrokeTriggered,
    triggerIdx,
    type,
    query,
  }
}
