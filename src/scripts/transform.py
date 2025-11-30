import json
import os
import asyncio

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
    schema = g_schema.copy()

    with open(file, 'r') as f:
        data = json.load(f)

    count = 0

    for conv in data:
        schema['metadata'] = {
            'model': 'chat',
            'name': conv['title'],
            'id': conv['id'],
            'created_at': conv['inserted_at'],
            'highlight': '',
            'update_at': conv['updated_at']
        }
        # print(schema)
        for k, v in conv['mapping'].items():
            message = v['message']

            if not message:
                continue

            files = message['files']

            if len(files) > 0:
                schema['metadata']['model'] = 'multimodal'

            message_item = message['fragments']

            for frag in message_item:
                type = frag['type'].lower()

                if type not in ('request', 'response'):
                    continue

                _type = 'user' if type == 'request' else 'assistant'

                item = {
                    'role': _type,
                    'content': frag['content']
                }

                if item in schema['chats']:
                    continue  # Avoid duplication

                schema['chats'].append(item)
                if not schema['metadata']['highlight']:
                    for_strip = item['content'].split(' ')

                    schema['metadata']['highlight'] = ' '.join(for_strip if len(for_strip) < 10 else for_strip[9]).strip()
        if len(schema['chats']) > 0:
            save(schema)
            count += 1

    print(f"Saved: \033[32m{count}\033[0m files")
    return True


def save(data: dict):
    try:
        dir = "~/.IntelliDesk/.store"
        name = data['metadata']['id']
        path = os.path.join(os.path.expanduser(dir), f"{name}.json")
        print(f"Saving: {name}")

        with open(path, 'w') as f:
            json.dump(data, f, indent=2)

        return True
    except Exception as e:
        print(e)
        return False


# asyncio.run(transformDS())


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


# save_as_dict()
