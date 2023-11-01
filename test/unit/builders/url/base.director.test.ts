import BaseURLDirector from '../../../../src/util/builders/url/base.director.js'

describe('BaseURLDirector', () => {
  const baseUrlDirector = new BaseURLDirector('https://en.m.wikipedia.com/')

  describe('buildURL', () => {
    it('should return URL object with path', () => {
      const url = baseUrlDirector.buildURL('v1/test/api')

      expect(url.href).toBe('https://en.m.wikipedia.com/v1/test/api')
    })

    it('should return URL object with mwApiPath param', () => {
      const url = baseUrlDirector.buildURL('api.php')

      expect(url.href).toBe('https://en.m.wikipedia.com/api.php')
    })

    it('should return URL object with mwApiPath ans mwWikiPath params', () => {
      const url = baseUrlDirector.buildURL('api.php', 'w')

      expect(url.href).toBe('https://en.m.wikipedia.com/w/api.php')
    })

    it('forward slashes at the beginnig of mwApiPath ans mwWikiPath params should be trimmed', () => {
      const url = baseUrlDirector.buildURL('/api.php', '/w')

      expect(url.href).toBe('https://en.m.wikipedia.com/w/api.php')
    })
  })

  describe('buildWikimediaApiURL', () => {
    it('should return rest URL with provided path and trailing char at the end', () => {
      const url = baseUrlDirector.buildWikimediaApiURL('api/rest_v2')

      expect(url.href).toBe('https://en.m.wikipedia.com/api/rest_v2/')
    })

    it('should return rest URL with default path and trailing char at the end', () => {
      const url = baseUrlDirector.buildWikimediaApiURL()

      expect(url.href).toBe('https://en.m.wikipedia.com/api/rest_v1/')
    })
  })

  describe('buildWikimediaMobileApiUrl', () => {
    it('should automatically return mobile rest URL with provided api rest path', () => {
      const url = baseUrlDirector.buildWikimediaMobileApiUrl('api/rest_v2')

      expect(url.href).toBe('https://en.m.wikipedia.com/api/rest_v2/page/mobile-html/')
    })

    it('should return mobile rest URL with default path and trailing char', () => {
      const url = baseUrlDirector.buildWikimediaMobileApiUrl()

      expect(url.href).toBe('https://en.m.wikipedia.com/api/rest_v1/page/mobile-html/')
    })
  })

  describe('buildWikimediaDesktopApiUrl', () => {
    it('should automatically return a desktop URL with provided api rest path', () => {
      const url = baseUrlDirector.buildWikimediaDesktopApiUrl('api/rest_v2')

      expect(url.href).toBe('https://en.m.wikipedia.com/api/rest_v2/page/html/')
    })

    it('should return a desktop URL with default path and trailing char', () => {
      const url = baseUrlDirector.buildWikimediaDesktopApiUrl()

      expect(url.href).toBe('https://en.m.wikipedia.com/api/rest_v1/page/html/')
    })
  })

  describe('buildModuleURL', () => {
    it('should return a module URL with provided path and question mark as a trailing char', () => {
      const url = baseUrlDirector.buildModuleURL('w/reload.php')

      expect(url).toBe('https://en.m.wikipedia.com/w/reload.php?')
    })

    it('should return a module URL with default path and question mark as a trailing char', () => {
      const url = baseUrlDirector.buildModuleURL()

      expect(url).toBe('https://en.m.wikipedia.com/w/load.php?')
    })
  })
})
