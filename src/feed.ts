import {create} from 'xmlbuilder2'
import {XMLBuilder} from "xmlbuilder2/lib/interfaces";
import {getYamlFileContents} from "./yamlHandler";
import {writeXmlToFile} from "./xmlHandler";
import {Document, ParsedNode} from "yaml";

const yamlFile = './resources/feed.yaml'
const xmlFile = './resources/feed.xml'

const ChannelFields:{
    ymlField: string,
    xmlField: string
}[] = [
    {
        ymlField: 'title',
        xmlField: 'title'
    },
    {
        ymlField: 'language',
        xmlField: 'language'
    },
    {
        ymlField: 'format',
        xmlField: 'format'
    },
    {
        ymlField: 'subtitle',
        xmlField: 'subtitle'
    },
    {
        ymlField: 'author',
        xmlField: 'itunes:author'
    },
    {
        ymlField: 'description',
        xmlField: 'description'
    },
    {
        ymlField: 'image',
        xmlField: 'itunes:image'
    },
    {
        ymlField: 'category',
        xmlField: 'itunes:category'
    },
    {
        ymlField: 'link',
        xmlField: 'link'
    }
]
function createFeed(){
    const root = buildRootObject();
    const rss = buildRssObject(root)
    const channel = buildChannelAttributes(rss)
    const xmlString = convertFeedToString(channel)
    writeXmlToFile(xmlString, xmlFile)
}

function convertFeedToString(root: XMLBuilder){
    //console.log(xmlString);
    return root.end({prettyPrint: true})
}

function buildRootObject(){
    return create({ version: "1.0", encoding: "UTF-8"});
}

function buildRssObject(root: XMLBuilder){
    return root.ele('rss', {
        version:"2.0" ,
        'xmlns:itunes':"http://www.itunes.com/dtds/podcast-1.0.dtd",
        'xmlns:content':"http://purl.org/rss/1.0/modules/content/"
    })
}

function buildChannelAttributes(rss: XMLBuilder){
    const yamlContent = getYamlFileContents(yamlFile)
    const channel = rss.ele('channel')
    addChannelDescriptors(channel, yamlContent)
    return channel
}

function addChannelDescriptors(channel: XMLBuilder, yamlContent: Document.Parsed<ParsedNode, true>){
    for (const channelField of ChannelFields) {
        const field = yamlContent.get(channelField.ymlField);
        if(isString(field) ){
            if(channelField.ymlField === 'image'){
                const link = yamlContent.get('link')
                if(isString(link)){
                    channel.ele(channelField.xmlField, {
                        'href': `${<string>link}${<string>field}`
                    })
                }

            } else if(channelField.ymlField === 'category'){
                channel.ele(channelField.xmlField, {
                    'text': `${<string>field}`
                })
            }else
                channel.ele(channelField.xmlField).txt(<string>field)
        }

    }
}
/**
function addChannelItemDescriptors(channel: XMLBuilder, yamlContent: Document.Parsed<ParsedNode, true>){
    const fieldName:string = 'item'
    const index = 0;
   // while(yamlContent.hasIn(fieldName, index)){
    //    const field = yamlContent.getIn('item')
   // }
}**/

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

createFeed();