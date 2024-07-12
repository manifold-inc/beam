import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
export function markdownToHtml(markdown: string) {
  return DOMPurify.sanitize(marked.parse(markdown, { breaks: true }) as string)
}

export function isCharacterALetter(char: string) {
  return /[a-zA-Z]/.test(char)
}

export function getQueryPaginationInput(
  itemsPerPage: number,
  currentPageNumber: number
) {
  return {
    take: itemsPerPage,
    skip:
      currentPageNumber === 1
        ? undefined
        : itemsPerPage * (currentPageNumber - 1),
  }
}

