import { prep_user_input } from "./file_util";
import { MistralBase } from "./Base";

let ai_ms_pid

export async function MistraMultimodal({ text, model_name }) {
    return MistralBase({
        text,
        model_name,
        handleUserInput: prep_user_input,
        functionName: 'MistraMultimodal'
    });
}


export async function MistraChat({ text, model_name }) {
    return MistralBase({
        text,
        model_name,
        functionName: 'MistraChat'
    });
}
