import json
import os
import asyncio
import datetime
import time

file = 'transformed_conversations.json'

g_schema = {
    'metadata': {
        'model': 'chat',
        'name': '',
        'id': '',
        'created_at': '',
        'update_at': '',
        'highlight': ''
    },
    'chats': []
}


def hasFiles(item: dict):
    for k, v in item.items():
        for k2, v2 in v.items():
            if isinstance(v2, dict):
                if len(v2['files']) > 0:
                    return True
    return False


async def transformDS():
    with open(file, 'r') as f:
        data = json.load(f)

    count = 0

    for conv in data:
        # Create a NEW schema object for each conversation
        schema = {
            'metadata': {
                'model': 'chat',
                'name': '',
                'id': '',
                'created_at': '',
                'update_at': '',
                'highlight': ''
            },
            'chats': []  # This gets reset for each conversation
        }

        schema['metadata'] = {
            'model': 'chat',
            'name': conv['title'],
            'id': conv['id'],
            'created_at': conv['inserted_at'],
            'highlight': '',
            'update_at': conv['updated_at']
        }

        # Reset model to 'chat' for each conversation
        schema['metadata']['model'] = 'chat'

        for k, v in conv['mapping'].items():
            message = v['message']

            if not message:
                continue

            files = message.get('files', [])
            message_item = message.get('fragments', [])

            # Check for multimodal content
            if len(files) > 0:
                schema['metadata']['model'] = 'multimodal'

            for frag in message_item:
                frag_type = frag.get('type', '').lower()

                if frag_type not in ('request', 'response'):
                    continue

                _type = 'user' if frag_type == 'request' else 'assistant'

                item = {
                    'role': _type,
                    'content': frag.get('content', '')
                }

                # Check if item already exists to avoid duplication
                if not any(existing_item['role'] == item['role']
                           and existing_item['content'] == item['content']
                           for existing_item in schema['chats']):
                    schema['chats'].append(item)

                    # Set highlight only if not already set
                    if not schema['metadata']['highlight']:
                        content_words = item['content'].split()
                        cleaned_words = [
                            word.replace('\n', '').replace('<', '').replace('>', '')
                            .replace('/', '').replace('"', "'")
                            for word in content_words
                            if word.strip()
                        ]
                        highlight = cleaned_words if len(cleaned_words) <= 8 else cleaned_words[:8]
                        schema['metadata']['highlight'] = ' '.join(highlight)

        # Only save if there are chats and we have valid content
        if len(schema['chats']) > 0 and any(chat['content'].strip() for chat in schema['chats']):
            success = save(schema)
            if success:
                count += 1

    print(f"Saved: \033[32m{count}\033[0m files")
    return True


def save(data: dict):
    try:
        dir = "cache"
        name = data['metadata']['id']
        path = os.path.join(dir, f"{name}.json")

        # Create directory if it doesn't exist
        os.makedirs(dir, exist_ok=True)

        print(f"Saving: {name}")

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        return True
    except Exception as e:
        print(f"Error saving {data['metadata']['id']}: {e}")
        return False


def save_as_dict():
    dir = "/home/skye/.IntelliDesk/.store"
    for file in os.listdir(dir):
        fpath = os.path.join(dir, file)
        data = None
        try:
            with open(fpath, 'r') as f:
                data = json.load(f)
        except Exception as e:
            print(e, file)

        if data and isinstance(data, list):
            new_data = data[0]

            with open(fpath, 'w') as fw:
                json.dump(new_data, fw, indent=2)
            print(f"Saved: {fpath}")


def metadata_update():
    dir = "cache"  # "/home/skye/.IntelliDesk/.store"
    for file in os.listdir(dir):
        fpath = os.path.join(dir, file)
        data = None
        try:
            with open(fpath, 'r') as f:
                data = json.load(f)
        except Exception as e:
            print(e, file)

        o_metadata = data['metadata']

        if o_metadata.get('timestamp', None):
            data['metadata'] = {
                'model': o_metadata['model'],
                'name': o_metadata['name'],
                'id': o_metadata['id'],
                'created_at': o_metadata.get('timestamp'),
                'update_at': o_metadata['timestamp'],
                'highlight': o_metadata['highlight']
            }

            with open(fpath, 'w') as fw:
                json.dump(data, fw, indent=2)
            print(f"Updated: {fpath}")


def time_upd():
    dt = datetime.timedelta()
    print(dt)


if __name__ == "__main__":
    # save_as_dict()
    asyncio.run(transformDS())
    metadata_update()
    # time_upd()
