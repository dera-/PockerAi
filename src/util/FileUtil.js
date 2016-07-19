import fs from 'fs';

const DIR_PATH = '../../data/file/'

export default class FileUtil {
  static getContent(fileName) {
    const content = fs.readFileSync(DIR_PATH + fileName);
    return content.toString().split('\n');
  }

  static saveContent(fileName, csvLines) {
    console.log(fileName);
    console.log(csvLines);
    const data = csvLines.join('\n');
    fs.writeFileSync(fileName, data); 
  }
}