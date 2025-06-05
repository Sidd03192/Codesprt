import axios from 'axios';


const API = axios.create({
  baseURL: 'https://emkc.org/api/v2/piston',
  headers: {
    'Content-Type': 'application/json',
  },
});
const LanguageVersions = {
  javascript: '18.15.0',
  python: '3.10.0',
  java: '6.12.0',
};


export const executeCode = async (language, sourceCode) => {
    console.log('Executing code in language:', language);
    const response = await API.post('/execute', {
        "language": language,
        "version": LanguageVersions[language],
        "files": [
            {
                "content": sourceCode,
            }
        ],
    });
    


    // need to add timeouts. 

  
console.log(response.data);
  return response.data;
}