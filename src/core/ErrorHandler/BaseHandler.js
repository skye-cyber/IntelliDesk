/// <reference path="../../main/preload.type.ts" />
import { handleDevErrors } from "./ErrorHandler"
import errorHandler from "../../ui/components/ErrorHandler/ErrorHandler"
import { StateManager } from "../managers/StatesManager.ts"
import { appIsDev } from "../managers/Conversation/Mistral/shared"
import { staticPortalBridge, streamingPortalBridge } from "../PortalBridge.ts"
import { clientmanager } from "../managers/Conversation/Mistral/ClientManager.ts"
import { globalEventBus } from "../Globals/eventBus.ts"


export async function BaseErrorHandler(error, userMessagePID, assistantMessagePID, callback) {
    globalEventBus.emit('executioncycle:end')

    const user_text = StateManager.get('userInputText')

    streamingPortalBridge.closeStreamingPortal(assistantMessagePID)
    staticPortalBridge.closeComponent(userMessagePID)

    // Rotate keys if error is key error ie rate limit 429->ratelimit
    if (error.statusCode && [401, 429].includes(error.statusCode)) {
        const rotationSuccess = await clientmanager.rotate_keychain()
        window.desk.api.popHistory("user")
        if (typeof rotationSuccess) return callback(user_text)

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
        handleDevErrors(error, userMessagePID, assistantMessagePID, user_text)
    } else {
        errorHandler.showError(
            {
                title: error?.name,
                message: error.message || error,
                retryCallback: callback,
                callbackArgs: user_text
            })
    }
}
