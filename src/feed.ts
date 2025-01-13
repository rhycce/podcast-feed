import { create } from 'xmlbuilder2'
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces'
import { getYamlFileContents } from './yamlHandler'
import { writeXmlToFile } from './xmlHandler'
import { Document } from 'yaml'

const ChannelFields: {
  ymlField: string
  xmlField: string
}[] = [
  {
    ymlField: 'title',
    xmlField: 'title',
  },
  {
    ymlField: 'language',
    xmlField: 'language',
  },
  {
    ymlField: 'format',
    xmlField: 'format',
  },
  {
    ymlField: 'subtitle',
    xmlField: 'subtitle',
  },
  {
    ymlField: 'author',
    xmlField: 'itunes:author',
  },
  {
    ymlField: 'description',
    xmlField: 'description',
  },
  {
    ymlField: 'image',
    xmlField: 'itunes:image',
  },
  {
    ymlField: 'category',
    xmlField: 'itunes:category',
  },
  {
    ymlField: 'link',
    xmlField: 'link',
  },
]

const ChannelItemFields: {
  ymlField: string
  xmlField: string
}[] = [
  {
    ymlField: 'title',
    xmlField: 'title',
  },
  {
    ymlField: 'duration',
    xmlField: 'itunes:duration',
  },
  {
    ymlField: 'published',
    xmlField: 'pubDate',
  },
  {
    ymlField: 'description',
    xmlField: 'description',
  },
]

function createFeed(xmlFile: string, yamlFile: string) {
  console.log(`Reading yaml file from ${yamlFile}`)
  const root = buildRootObject()
  const rss = buildRssObject(root)
  const channel = buildChannelAttributes(rss, yamlFile)
  const xmlString = convertFeedToString(channel)
  writeXmlToFile(xmlString, xmlFile)
}

function convertFeedToString(root: XMLBuilder) {
  return root.end({ prettyPrint: true })
}

function buildRootObject() {
  return create({ version: '1.0', encoding: 'UTF-8' })
}

function buildRssObject(root: XMLBuilder) {
  return root.ele('rss', {
    version: '2.0',
    'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
    'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
  })
}

function buildChannelAttributes(rss: XMLBuilder, yamlFile: string) {
  const yamlContent = getYamlFileContents(yamlFile)
  const channel = rss.ele('channel')
  addChannelDescriptors(channel, yamlContent)
  addChannelItemDescriptors(channel, yamlContent)
  return channel
}

function addChannelDescriptors(channel: XMLBuilder, yamlContent: Document.Parsed) {
  for (const channelField of ChannelFields) {
    const field = yamlContent.get(channelField.ymlField)
    if (isString(field)) {
      if (channelField.ymlField === 'image') {
        const link = yamlContent.get('link')
        if (isString(link)) {
          channel.ele(channelField.xmlField, {
            href: `${<string>link}${<string>field}`,
          })
        }
      } else if (channelField.ymlField === 'category') {
        channel.ele(channelField.xmlField, {
          text: `${<string>field}`,
        })
      } else channel.ele(channelField.xmlField).txt(<string>field)
    }
  }
}

function addChannelItemDescriptors(channel: XMLBuilder, yamlContent: Document.Parsed) {
  const fieldName: string = 'item'
  let index = 0
  const author = yamlContent.get('author')
  while (yamlContent.hasIn([fieldName, index])) {
    // @ts-ignore
    const item: Document.Parsed = yamlContent.getIn([fieldName, index])
    const itemXml = channel.ele(fieldName)
    for (const itemField of ChannelItemFields) {
      const value = item.get(itemField.ymlField)
      if (isString(value)) itemXml.ele(itemField.xmlField).txt(<string>value)
    }
    const length = item.get('length')
    const file = item.get('file')
    const link = yamlContent.get('link')
    if (isString(length) && isString(file) && isString(link))
      itemXml.ele('enclosure', {
        length: length.replace(',', ''),
        url: `${link}${file}`,
        type: 'audio/mpeg',
      })
    if (isString(author)) itemXml.ele('itunes:author').txt(<string>author)
    index++
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

const [, , xmlFile, yamlFile] = process.argv
createFeed(xmlFile, yamlFile)
