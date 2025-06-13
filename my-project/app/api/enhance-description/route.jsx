
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
              "text": "Prompt:\nYou are an expert in creating coding problems for platforms like LeetCode. Your task is to rewrite the description of a coding problem to make it more engaging, clear, and structured like a professional LeetCode-style question. Follow these guidelines carefully.\n\nInput\nCode: This defines the problem's logic and constraints. Code may or may not be provided.\n\nInitial Description: A brief explanation of the problem's purpose.\n\nOutput Requirements\nRewrite the description to include:\n\nA Problem Statement:\n\nClearly describe the task.\n\nSpecify constraints and requirements.\n\nProvide relevant details for understanding the problem.\n\nExample Test Cases:\n\nInclude test cases in a structured format.\n\nUse clear input and output examples with detailed explanations.\n\nVisual Aids:\n\nAdd diagrams or tables only for problems involving complex data structures (e.g., trees, graphs, linked lists) or situations where visual representation enhances clarity.\n\nDo not include diagrams for simple problems like basic math, strings, or arrays.\n\nImplementation Notes:\n\nIf code is provided, include only essential details needed to understand and use the code (e.g., a Node class for a linked list or helper functions).\n\nDo not include the full implementation unless it is critical to solving the problem.\n\nDo not use emojis in any part of the response.\n\nStructure the output professionally and straightforwardly, following this format:\n\nOutput Format\nProblem Title\nProblem Statement\n[Provide a detailed problem description, including constraints and requirements.]\n\nInput\n[Describe the format and type of input expected.]\n\nOutput\n[Describe the format and type of output expected.]\n\nConstraints\n\n[List all constraints.]\n\nExamples\n\nExample 1:\nInput:\n[Detailed input]\nOutput:\n[Expected output]\nExplanation:\n[Provide a clear explanation of how the output is derived from the input.]\n\nExample 2:\nInput:\n[Detailed input]\nOutput:\n[Expected output]\nExplanation:\n[Provide a clear explanation of how the output is derived from the input.]\n\nVisual Aid\n[Only include this section if applicable and relevant.]\n\nImplementation Notes\n[Add details about any helper classes, structures, or functions provided, such as a Node class or specific helper methods.]\n\nGood Luck!\n\n"
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "input_text",
              "text": "/**\r\n * Definition for singly-linked list.\r\n * public class ListNode {\r\n *     int val;\r\n *     ListNode next;\r\n *     ListNode() {}\r\n *     ListNode(int val) { this.val = val; }\r\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\r\n * }\r\n */\r\nclass Solution {\r\n    public ListNode reverseBetween(ListNode head, int left, int right) {\r\n        \r\n    }\r\n}\nGiven the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right, and return the reversed list."
            }
          ]
        },
        {
          "id": "msg_684ba4a0ed308199ad781a9a509de5000aacc4b65b7cc4ac",
          "role": "assistant",
          "content": [
            {
              "type": "output_text",
              "text": "**Problem Title:**  \nReverse a Sublist in a Singly Linked List\n\n**Problem Statement:**  \nGiven the head of a singly linked list and two integers `left` and `right`, reverse the nodes of the list starting from position `left` to position `right` (1-based indexing). Return the head of the modified linked list.\n\nYour task is to modify the list in-place by reversing the segment between `left` and `right`, inclusive. The nodes outside this segment should remain unchanged.\n\n**Constraints:**\n- The number of nodes in the list is between 1 and 5000.\n- `1 <= left <= right <= length of the list`.\n- The value of each node is between -1000 and 1000.\n\n---\n\n### Input\n- `head`: The head node of a singly linked list.\n- `left`: An integer representing the starting position of the segment to reverse (1-based index).\n- `right`: An integer representing the ending position of the segment to reverse (1-based index).\n\n---\n\n### Output\n- The head node of the list after reversing the nodes from position `left` to `right`.\n\n---\n\n### Examples\n\n**Example 1:**  \nInput:\n```\nhead = [1, 2, 3, 4, 5]\nleft = 2\nright = 4\n```\nOutput:\n```\n[1, 4, 3, 2, 5]\n```\nExplanation:\n- The segment to reverse is from position 2 to 4 (`2 -> 3 -> 4`).\n- Reversing this segment results in `4 -> 3 -> 2`.\n- The final list is `[1, 4, 3, 2, 5]`.\n\n---\n\n**Example 2:**  \nInput:\n```\nhead = [5]\nleft = 1\nright = 1\n```\nOutput:\n```\n[5]\n```\nExplanation:\n- The segment to reverse is a single node, so the list remains unchanged.\n\n---\n\n### Visual Aid\nLet's consider the first example:\n```\nInitial list: 1 -> 2 -> 3 -> 4 -> 5\nPositions:     1    2    3    4    5\n\nReverse from position 2 to 4:\nSegments before reversal: 1 | 2 -> 3 -> 4 | 5\nSegments after reversal:  1 | 4 -> 3 -> 2 | 5\n```\n\n---\n\n### Implementation Notes\nYou can assume the existence of a `ListNode` class as described:\n```java\npublic class ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n```\nUse helper techniques such as:\n- Dummy node to simplify boundary cases.\n- Iterative pointer manipulation to reverse the specified segment in-place.\n\nGood luck!"
            }
          ]
        }
      ],
      text: {
        "format": {
          "type": "text"
        }
      },
      reasoning: {},
      tools: [],
      temperature: 1,
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
