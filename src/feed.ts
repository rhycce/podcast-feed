import {create} from 'xmlbuilder2'
import {XMLBuilder} from "xmlbuilder2/lib/interfaces";
import {getYamlFileContents} from "./yamlHandler";
import {writeXmlToFile} from "./xmlHandler";

const yamlFile = './resources/feed.yaml'
const xmlFile = './resources/feed.xml'
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

    const title = yamlContent.get('title');
    if(isString(title) )
        channel.ele('title').txt(<string>yamlContent.get('title'))
    return channel
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

createFeed();