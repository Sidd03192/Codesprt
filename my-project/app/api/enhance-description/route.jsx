
import { NextResponse } from 'next/server';
import OpenAI from 'openai'; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  try {
    
    const response = await openai.responses.create({
      model: "gpt-4.1-nano",
      input: [
        {
          "role": "system",
          "content": [
            {
              "type": "input_text",
              "text": "You are an expert in creating coding problems for platforms like LeetCode. Given the following code and initial problem description, your task is to rewrite the description to make it more engaging, clear, and structured like a LeetCode-style question.\n\n### Input\n1. **Code**: The given code snippet defines the problem's logic and constraints You may get code or not get code. .\n2. **Initial Description**: A brief explanation of the problem's purpose.\n\n### Output Requirements\n- Enhance the initial description to include:\n  - A **problem statement** . Include an analogy ONLY FOR COMPLEX logical problems. \n  - **Headings** for clarity (e.g., **Input**, **Output**, **Constraints**, **Examples**).\n  - Example test cases with **code blocks** and detailed explanations.\n  - Visual aids like **diagrams** or tables where relevant for more complex problems. Do not include this for simple problems. \n  - Any assumptions about the input/output format if given code. \nDo not include emojis. \nDo not include emojis\n- The output should be formatted as:\nYour enhanced output might look like:\n\nMaximum Finder \nProblem Statement \nYou are given a list of integers representing mountain heights. Your goal is to find the tallest mountain in the list.\n\nInput Description \nnums: A list of integers representing mountain heights.\n\nOutput Description \nA single integer: the height of the tallest mountain.\n\nConstraints \n1 ≤ len(nums) ≤ 10^5\n\n-10^9 ≤ nums[i] ≤ 10^9\n\nExamples \nExample 1\nInput: nums = [1, 2, 3, 2]\nOutput: 3\nExplanation: The tallest mountain has a height of 3.\n\nDiagram \nCopy\nEdit\n   /\\\n  /  \\\n /    \\\n1   2   3   2\nUse this s\nSay good luck at the end. "
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "input_text",
              "text": "Do not show the whole code in the description, just point to places. \ndon't seperate each section too much with seperators. Include additional notes as a part of the descriptino in bullet points below the main description. \n"
            }
          ]
        },
        {
          "role": "assistant",
          "content": [
            {
              "type": "output_text",
              "text": "Dont include emojis. Make it professional"
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "input_text",
              "text": prompt
            }
          ]
        },
      ],
      text: {
        "format": {
          "type": "text"
        }
      },
      reasoning: {},
      tools: [],
      temperature: 0.55,
      max_output_tokens: 2048,
      top_p: 1,
      store: true
    });

    const improved = response.choices[0].message.content;
    return NextResponse.json({ improved });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
