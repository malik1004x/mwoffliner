import * as domino from 'domino'
import * as logger from '../Logger.js'
import { MobileRenderer } from './abstractMobile.render.js'
import { getStrippedTitleFromHtml } from '../util/misc.js'
import { RenderOpts, RenderOutput } from './abstract.renderer.js'

type PipeFunction = (value: DominoElement) => DominoElement | Promise<DominoElement>

// Represent 'https://{wikimedia-wiki}/api/rest_v1/page/mobile-html/'
export class WikimediaMobileRenderer extends MobileRenderer {
  constructor() {
    super()
  }

  private getStrippedTitle(renderOpts: RenderOpts): string {
    const { data, articleId } = renderOpts

    const strippedTitle = getStrippedTitleFromHtml(data)
    return strippedTitle || articleId.replace('_', ' ')
  }

  public async render(renderOpts: RenderOpts): Promise<any> {
    try {
      const result: RenderOutput = []
      const { data, articleId, webp, _moduleDependencies, dump } = renderOpts
      dump.opts.isMobileRenderer = true
      const articleDetail = await renderOpts.articleDetailXId.get(articleId)

      const displayTitle = this.getStrippedTitle(renderOpts)
      if (data) {
        let mediaDependenciesVal
        let subtitlesVal
        const mobileHTML = domino.createDocument(data)
        const finalHTMLMobile = await this.pipeMobileTransformations(
          mobileHTML,
          this.convertLazyLoadToImages,
          this.removeEditContainer,
          this.removeHiddenClass,
          async (doc) => {
            const { finalHTML, subtitles, mediaDependencies } = await super.processHtml(
              doc.documentElement.outerHTML,
              dump,
              articleId,
              articleDetail,
              _moduleDependencies,
              webp,
              super.templateMobileArticle.bind(this),
            )

            mediaDependenciesVal = mediaDependencies
            subtitlesVal = subtitles
            return domino.createDocument(finalHTML)
          },
          this.restoreLinkDefaults,
        )

        result.push({
          articleId,
          displayTitle,
          html: finalHTMLMobile.documentElement.outerHTML,
          mediaDependencies: mediaDependenciesVal,
          subtitles: subtitlesVal,
        })
        return result
      }
    } catch (err) {
      logger.error(err.message)
      throw new Error(err.message)
    }
  }

  private async pipeMobileTransformations(value: DominoElement, ...fns: PipeFunction[]): Promise<DominoElement> {
    let result: DominoElement | Promise<DominoElement> = value
    for (const fn of fns) {
      result = fn(await result)
    }
    return result
  }

  private removeEditContainer(doc: DominoElement) {
    const editContainers = doc.querySelectorAll('.pcs-edit-section-link-container')

    editContainers.forEach((elem: DominoElement) => {
      elem.remove()
    })

    return doc
  }

  private convertLazyLoadToImages(doc: DominoElement) {
    const protocol = 'https://'
    const spans = doc.querySelectorAll('.pcs-lazy-load-placeholder')

    spans.forEach((span: DominoElement) => {
      // Create a new img element
      const img = doc.createElement('img') as DominoElement

      // Set the attributes for the img element based on the data attributes in the span
      img.src = protocol + span.getAttribute('data-src')
      img.setAttribute('decoding', 'async')
      img.setAttribute('data-file-width', span.getAttribute('data-data-file-width'))
      img.setAttribute('data-file-height', span.getAttribute('data-data-file-height'))
      img.setAttribute('data-file-type', 'bitmap')
      img.width = span.getAttribute('data-width')
      img.height = span.getAttribute('data-height')
      img.setAttribute('srcset', `${protocol}${span.getAttribute('data-srcset')}`)
      img.className = span.getAttribute('data-class')

      // Replace the span with the img element
      span.parentNode.replaceChild(img, span)
    })

    return doc
  }

  private removeHiddenClass(doc: DominoElement) {
    const pcsSectionHidden = 'pcs-section-hidden'
    const hiddenSections = doc.querySelectorAll(`.${pcsSectionHidden}`)
    hiddenSections.forEach((section) => {
      section.classList.remove(pcsSectionHidden)
    })
    return doc
  }

  private restoreLinkDefaults(doc: DominoElement) {
    const supElements = doc.querySelectorAll('sup')

    Array.from(supElements).forEach((sup: DominoElement) => {
      const anchor = doc.createElement('a')
      const mwRefLinkTextElement = sup.querySelector('.mw-reflink-text') as DominoElement

      let mwRefLinkText = ''
      if (mwRefLinkTextElement) {
        mwRefLinkText = mwRefLinkTextElement.textContent || ''
      }

      const existedAnchor = sup.querySelector('.reference-link')

      if (existedAnchor?.getAttribute('href')) {
        anchor.setAttribute('href', existedAnchor.getAttribute('href'))
      }
      anchor.className = 'reference-link'
      anchor.textContent = mwRefLinkText

      sup.innerHTML = ''
      sup.appendChild(anchor)
    })

    return doc
  }
}
