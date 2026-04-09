import { StateManager } from '../../StatesManager.ts';

StateManager.set('uploaded_files', [])

let globalIsDev = false;

export const appIsDev = async () => {
    try {
        globalIsDev = await window.desk.api2.appIsDev();
        return globalIsDev || false;
    } catch (error) {
        console.error('Error checking dev mode:', error);
        return false;
    }
};
