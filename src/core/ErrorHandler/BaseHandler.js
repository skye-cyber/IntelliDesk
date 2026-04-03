/// <reference path="../../main/preload.type.ts" />
import { handleDevErrors } from "./ErrorHandler"
import errorHandler from "../../ui/components/ErrorHandler/ErrorHandler"
import { StateManager } from "../managers/StatesManager"
import { appIsDev } from "../managers/Conversation/Mistral/shared"
import { streamingPortalBridge } from "../PortalBridge.ts"
import { clientmanager } from "../managers/Conversation/Mistral/ClientManager"
import { globalEventBus } from "../Globals/eventBus.ts"


export async function BaseErrorHandler(error, ai_ms_pid, callback) {
    globalEventBus.emit('executioncycle:end')

    window.desk.api.popHistory("user")
    const user_text = StateManager.get('userInputText')

    streamingPortalBridge.closeStreamingPortal(StateManager.get('user_message_portal'))
    streamingPortalBridge.closeStreamingPortal(ai_ms_pid)
    // staticPortalBridge.closeComponent(StateManager.get('loader-element-id'))

    // Rotate keys if error is key error ie rate limit
    if (error.statusCode && error.statusCode === 401) {
        const rotation_okay = await clientmanager.rotate_keychain()

        if (typeof rotation_okay !== 'string') return callback(user_text)

        error = {
            name: 'KeyChainError',
            origin: 'Key Chain Rotatio',
            message: typeof (rotation_okay === 'tring') ? rotation_okay : "No valid key founf in keychain",
            type: 'KeyChain Error',
            errorType: 'RuntimeError',
            stack: 'clientmanager.rotate_keychain\n at BaseErrorHandler',
            statusCode: 541
        }

    }

    const isDev = await appIsDev()
    if (isDev) {
        handleDevErrors(error, StateManager.get('user_message_portal'), StateManager.get('ai_message_portal'), user_text)
    } else {
        errorHandler.showError(
            {
                title: error?.name,
                message: error.message || error,
                retryCallback: callback,
                callbackArgs: {
                    text: user_text,
                    model_name: StateManager.get('currentModel')
                }
            })
    }
}
