import AjvModule from 'ajv'
import type { KeywordCxt } from 'ajv'
import { byGrapheme } from 'split-by-grapheme'

const Ajv = AjvModule.default
const ajv = new Ajv({ allErrors: true })

ajv.addKeyword({
  keyword: 'checkRegexFromBuffer',
  validate: (regexStr: string, buffer) => {
    if (Buffer.isBuffer(buffer)) {
      const regex = new RegExp(regexStr)
      const binary = buffer.toString('binary')
      return regex.test(binary)
    }
    return false
  },
  error: {
    message: 'must match regex pattern',
  },
})

ajv.addKeyword({
  keyword: 'uMaxLength',
  type: 'string',
  validate: (max_length: number, value) => {
    return value.split(byGrapheme).length <= max_length
  },
  error: {
    message: (cxt: KeywordCxt): string => {
      return `must NOT have more than ${cxt.schemaValue} graphemes`
    },
  },
})

const schema = {
  type: 'object',
  properties: {
    Name: { type: 'string', minLength: 1 },
    Creator: { type: 'string', minLength: 1 },
    Description: { type: 'string', uMaxLength: 80, minLength: 1 },
    Language: { type: 'string', minLength: 1, pattern: '^\\w{3}(,\\w{3})*$' },
    Publisher: { type: 'string', minLength: 1 },
    Title: { type: 'string', uMaxLength: 30, minLength: 1 },
    Date: { type: 'string', maxLength: 10, minLength: 10 },
    'Illustration_48x48@1': { checkRegexFromBuffer: '^\x89\x50\x4e\x47\x0d\x0a\x1a\x0a.+' },
    LongDescription: { type: 'string', uMaxLength: 4000 },
    License: { type: 'string' },
    Tags: { type: 'string' },
    Relation: { type: 'string' },
    Flavour: { type: 'string' },
    Source: { type: 'string' },
    Counter: { type: 'string' },
    Scraper: { type: 'string' },
  },
  required: ['Creator', 'Description', 'Language', 'Publisher', 'Title', 'Illustration_48x48@1'],
  additionalProperties: true,
}

const validate = ajv.compile(schema)

export const validateMetadata = (metaData): void => {
  // !!!!! METADATA VALIDATION DISABLED !!!!!
  // this is for my own private wiki. i have confirmed it doesn't cause trouble.
  // maybe it does on others. don't know, don't care.
  // don't use this branch, is all. -malik
  return
}
