import { GoogleGenerativeAI } from "@google/generative-ai";
import { EnvConfig } from "./env.config";

const apiKey = EnvConfig().gemini.apiKey;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
});

export const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseModalities: [],
	responseMimeType: "text/plain",
};

export const multipleChoicePrompt = `Generate a multiple choice quiz based on the given transcript. Each question should test understanding of the content.

The response should be a JSON array of questions in this exact format:
[
  {
    "question": string,
    "options": string[],
    "answer": string,
    "explanation": string
  }
]

Requirements:
1. Generate 3-5 questions
2. Each question should have 4 options
3. The answer must be one of the options
4. Include a brief explanation for the correct answer
5. Return ONLY valid JSON, no markdown or additional text`;

export const openEndedPrompt = `Generate open-ended questions based on the given transcript. Each question should test understanding of the content.

The response should be a JSON array of questions in this exact format:
[
  {
    "question": string,
    "answer": string,
    "explanation": string
  }
]

Requirements:
1. Generate 3-5 questions
2. Each question should require a short answer
3. The answer should be a concise model response
4. Return ONLY valid JSON, no markdown or additional text`;

export const answerValidationPrompt = `Compare if the user's answer makes sense with the correct answer and return a JSON response in this exact format:

{
  "correct": boolean,
  "explanation": string
}

Rules:
1. If the answer is correct:
   - Set "correct" to true
   - Set "explanation" to "make sense"
2. If the answer is incorrect:
   - Set "correct" to false
   - Set "explanation" to a brief reason why it's wrong

Question: {question}
Correct answer: {answer}
User's answer: {userAnswer}

Return ONLY the JSON object, no additional text or markdown.`;

export const transcriptPrompt = `Here is a transcript JSON where each item contains "id", "start", "end", and "text" fields. Your task is to analyze this transcript and transform it into a structured ContentTable format.

The expected structure is:

[
  {
    "chapter": string,
    "summary": string,
    "transcript_start_id": number,
    "transcript_end_id": number
  }
]

Your task is to:
1. Analyze the transcript and divide it into logical chapters based on topic changes
2. For each chapter:
   - Create a concise, descriptive title
   - Write a brief summary of the main points
   - Include the transcript_start_id (id of first transcript in chapter) and transcript_end_id (id of last transcript in chapter)
3. Structure the response exactly as shown above

IMPORTANT: Return ONLY a valid JSON object with the structure shown. Do not include any markdown formatting, code blocks, or additional text in your response.`;
