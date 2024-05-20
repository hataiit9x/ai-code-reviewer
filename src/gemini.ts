import axios, {AxiosInstance} from 'axios';
import {geminiCompletionsConfig, suggestContent, systemContent} from "./utils";

const SAFETY_SETTINGS = [
    {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
    },
    {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
    },
    {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
    },
    {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
    },
]

export class Gemini {
    constructor(private apiUrl: string, private accessToken: string, private customModel?: string) {

    }
    async reviewCodeChange(change: string): Promise<string> {
    const apiKey = this.accessToken
    const geminiAPIURL = this.apiUrl
    const model = this.customModel || geminiCompletionsConfig.model
    const url = `${geminiAPIURL}/v1beta/models/${model}:generateContent?key=${apiKey}` // change to generateContent
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.41',
    }
    const body = {
        contents: [
            systemContent,
            suggestContent,
            {
                role: 'user',
                parts: [
                    {
                        text: change,
                    },
                ],
            },
        ],
        safetySettings: SAFETY_SETTINGS,
    }
    console.log('calling gemini api...');
    console.log('gemini api url:', url);
    console.log('gemini api body:', body);

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    console.log('gemini response:', response);
    if (!response.ok) {
        throw new Error('Request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

}
