## AUDIO model integration
## Audio models
- `voxtral-small-latest`
-  `voxtral-mini-latest`
- ``
### sample code

```javascript
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
});
```
## Transcription with file upload
```js
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

## Tanscribe with timestamps
```js
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env["MISTRAL_API_KEY"];

const client = new Mistral({ apiKey: apiKey });

const transcriptionResponse = await client.audio.transcriptions.complete({
  model: "voxtral-mini-latest",
  fileUrl: "https://docs.mistral.ai/audio/obama.mp3",
  timestamp_granularities: ["segment"]
});
```

## Length caps
- ≈20 minutes for Chat with Audio for both models.
- ≈15 minutes for Transcription.


## Thinking models integration
### model 
- `magistral-small-latest`
- `magistral-medium-latest`
### Think Structure (NEW)
```json
[
  {
    "role": "system",
    "content": [
      {
        "type": "text",
        "text": "System prompt, with both instructions and"
      },
      {
        "type": "thinking",
        "thinking": [
          {
            "type": "text",
            "text": "Encapsulated reasoning instructions."
          }
        ]
      }
    ]
  },
  {
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "User input."
      }
    ]
  },
  {
    "role": "assistant",
    "content": [
      {
        "type": "thinking",
        "thinking": [
          {
            "type": "text",
            "text": "Reasoning traces."
          }
        ]
      },
      {
        "type": "text",
        "text": "Followed by the final answer."
      }
    ]
  }
]
```
### Thinking structure (OLD)
```json
[
  {
    "role": "system",
    "content": "System prompt, with both instructions and\n<think>\nEncapsulated reasoning instructions.\n</think>\n"
  },
  {
    "role": "user",
    "content": "User input."
  },
  {
    "role": "assistant",
    "content": "<think>\nReasoning traces.\n</think>\nFollowed by the final answer."
  }
]
```
