import { Window } from 'happy-dom'

export function summarize(html: string): { summary: string; hasMore: boolean } {
  const win = new Window()
  const doc = new win.DOMParser().parseFromString(html, 'text/html')

  const allowedTags = ['p', 'ul', 'ol', 'h3', 'pre', 'img']

  let firstElement

  for (const tag of allowedTags) {
    firstElement = doc.body.querySelector(tag)
    if (firstElement) {
      break
    }
  }

  if (firstElement) {
    if (
      firstElement.textContent &&
      firstElement.textContent.length < 20 &&
      firstElement.nextElementSibling
    ) {
      return {
        summary:
          firstElement.outerHTML + firstElement.nextElementSibling.outerHTML,
        hasMore: doc.body.children.length > 2,
      }
    } else {
      return {
        summary: firstElement.outerHTML,
        hasMore: doc.body.children.length > 1,
      }
    }
  } else {
    return { summary: "<p>Summary couldn't be generated</p>", hasMore: false }
  }
}
