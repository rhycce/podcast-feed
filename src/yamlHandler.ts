import fs from 'fs'
import { parseDocument } from 'yaml'

const UTF8 = 'utf8'
export function getYamlFileContents(path: string) {
  const file = fs.readFileSync(path, UTF8)
  return parseDocument(file)
}
