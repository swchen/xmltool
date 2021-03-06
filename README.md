# xmltool



A XML parser for JavaScript



## Installation



```shell
npm install xmltool

// or
yarn add xmltool
```





## Usage



```javascript
import {Parser} from "xmltool";

const xml = `
<user>
    <name>Bill</name>
    <age>18</age>
</user>
`;

const doc = new Parser(xml).parse();
```



### Option



```javascript
new Parser(text, option)
```



`option` - Object bag of settings.

Settings supported:

- `namespace` - Boolean. If true, then xml namespaces are supported. default value is `true`.



## Unsupported



1. This parser doesn't parse document type declaration(DTD)'s [intSubset](https://www.w3.org/TR/2008/REC-xml-20081126/#NT-intSubset), only set the `intSubset` text to document type node `internalSubset` property.
2. This parser doesn't normalize the attribute value. [Attribute-Value Normalization](https://www.w3.org/TR/2008/REC-xml-20081126/#AVNormalize)





## Reference



1. [XML 1.0](https://www.w3.org/TR/xml/)
2. [Namespaces in XML 1.0](https://www.w3.org/TR/xml-names/)
3. [System.Xml.Linq](https://docs.microsoft.com/en-us/dotnet/api/system.xml.linq)
4. [System.Xml](https://docs.microsoft.com/en-us/dotnet/api/system.xml)
5. [sax-js](https://github.com/isaacs/sax-js) A sax style parser for JS.
6. [pjxml](https://github.com/smeans/pjxml) Pure JavaScript XML parser.



## License



[MIT](LICENSE)











