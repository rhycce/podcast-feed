import fs from 'fs'
export function writeXmlToFile(content: string, path: string) {
  try {
    console.log(`Writing xml file`)
    fs.writeFileSync(path, content)
    console.log(`File written successfully to path: ${path}`)
  } catch (err) {
    console.log(`Unable to write to file: ${path}. Error message: ${JSON.stringify(err)}`)
  }
}
