## New Model:
- ministral-8b-2512
- magistral-small-2509 - multimodal-reasoning (magistral-medium-latest)
- voxtral-small-2507 -- audioinput
- devstral-2512 - coding agent
- open-mistral-nemo-2407 - multilingual

## Audio
```js
import { Mistral } from "@mistralai/mistralai";
import fs from "fs";

const apiKey = process.env["MISTRAL_API_KEY"];

const client = new Mistral({ apiKey: apiKey });

// Encode the audio file in base64
const audio_file = fs.readFileSync('local_audio.mp3');
const audio_base64 = audio_file.toString('base64');

const chatResponse = await client.chat.complete({
  model: "voxtral-mini-latest",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "input_audio",
          input_audio: audio_base64,
        },
        {
          type: "text",
          text: "What's in this file?",
        },
      ],
    },
  ],
  //timestamp_granularities: ["segment"]
});

// Passing file path
import { Mistral } from "@mistralai/mistralai";
import fs from "fs";

const apiKey = process.env["MISTRAL_API_KEY"];

const client = new Mistral({ apiKey: apiKey });

const audio_file = fs.readFileSync('/path/to/file/audio.mp3');
const transcriptionResponse = await client.audio.transcriptions.complete({
  model: "voxtral-mini-latest",
  file: {
    fileName: "audio.mp3",
    content: audio_file,
  },
  // language: "en"
});
```

## Reasoning model
```json
{
  "role": "system",
  "content": [
    {
      "type": "text",
      "text": "# HOW YOU SHOULD THINK AND ANSWER\n\nFirst draft your thinking process (inner monologue) until you arrive at a response. Format your response using Markdown, and use LaTeX for any mathematical equations. Write both your thoughts and the response in the same language as the input.\n\nYour tahinking process must follow the template below:"
    },
    {
      "type": "thinking",
      "thinking": [
        {
          "type": "text",
          "text": "Your thoughts or/and draft, like working through an exercise on scratch paper. Be as casual and as long as you want until you are confident to generate the response to the user."
        }
      ]
    },
    {
      "type": "text",
      "text": "Here, provide a self-contained response."
    }
  ]
}
```
## Document AI-OCR
### model
> mistral-ocr-latest
## Integration with IntelliDesk
```js
import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "document_url",
        documentUrl: "https://arxiv.org/pdf/2201.04234"
    },
    tableFormat: "html", // default is null
    // extractHeader: False, // default is False
    // extractFooter: False, // default is False
    includeImageBase64: true
});
```

## Citations & References
### Structure
```python
references = {
  "0": {
    "url": "https://en.wikipedia.org/wiki/2024_Nobel_Peace_Prize",
    "title": "2024 Nobel Peace Prize",
    "snippets": [
      [
        "The 2024 Nobel Peace Prize, an international peace prize established according to Alfred Nobel's will, was awarded to Nihon Hidankyo (the Japan Confederation of A- and H-Bomb Sufferers Organizations), for their activism against nuclear weapons, assisted by victim/survivors (known as Hibakusha) of the atomic bombings of Hiroshima and Nagasaki in 1945.",
        "They will receive the prize at a ceremony on 10 December 2024 at Oslo, Norway."
      ]
    ],
    "description": None,
    "date": "2024-11-26T17:39:55.057454",
    "source": "wikipedia"
  },
  "1": {
    "url": "https://en.wikipedia.org/wiki/Climate_Change",
    "title": "Climate Change",
    "snippets": [
      [
        "Present-day climate change includes both global warming—the ongoing increase in global average temperature—and its wider effects on Earth’s climate system. Climate change in a broader sense also includes previous long-term changes to Earth's climate. The current rise in global temperatures is driven by human activities, especially fossil fuel burning since the Industrial Revolution. Fossil fuel use, deforestation, and some agricultural and industrial practices release greenhouse gases. These gases absorb some of the heat that the Earth radiates after it warms from sunlight, warming the lower atmosphere. Carbon dioxide, the primary gas driving global warming, has increased in concentration by about 50% since the pre-industrial era to levels not seen for millions of years."
      ]
    ],
    "description": None,
    "date": "2024-11-26T17:39:55.057454",
    "source": "wikipedia"
  },
  "2": {
    "url": "https://en.wikipedia.org/wiki/Artificial_Intelligence",
    "title": "Artificial Intelligence",
    "snippets": [
      [
        "Artificial intelligence (AI) refers to the capability of computational systems to perform tasks typically associated with human intelligence, such as learning, reasoning, problem-solving, perception, and decision-making. It is a field of research in computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals. Such machines may be called AIs."
      ]
    ],
    "description": None,
    "date": "2024-11-26T17:39:55.057454",
    "source": "wikipedia"
  }
}
```
