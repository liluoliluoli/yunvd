import mitt from 'mitt';
import KeyEvent from 'react-native-keyevent';
import {SupportedKeys} from './SupportedKeys';
import {RemoteControlManagerInterface} from './RemoteControlManager.interface';

const KEY_CODE_MAPPING: Record<number, SupportedKeys> = {
    21: SupportedKeys.Left,
    22: SupportedKeys.Right,
    20: SupportedKeys.Down,
    19: SupportedKeys.Up,
    66: SupportedKeys.Enter,
    23: SupportedKeys.Enter,
    67: SupportedKeys.Back,
};

class RemoteControlManager implements RemoteControlManagerInterface {
    private eventEmitter = mitt<{ keyDown: SupportedKeys }>();

    constructor() {
        KeyEvent.onKeyDownListener(this.handleKeyDown);
    }

    private handleKeyDown = (keyEvent: { keyCode: number }): void => {
        const mappedKey = KEY_CODE_MAPPING[keyEvent.keyCode];
        if (mappedKey) {
            this.eventEmitter.emit('keyDown', mappedKey);
        }
    };

    addKeydownListener = (listener: (event: SupportedKeys) => void): ((event: SupportedKeys) => void) => {
        this.eventEmitter.on('keyDown', listener);
        return listener;
    };

    removeKeydownListener = (listener: (event: SupportedKeys) => void): void => {
        this.eventEmitter.off('keyDown', listener);
    };

    emitKeyDown = (key: SupportedKeys): void => {
        this.eventEmitter.emit('keyDown', key);
    };

    cleanup = (): void => {
        KeyEvent.removeKeyDownListener();
    };
}

console.log("prepare export instance")
export default new RemoteControlManager();
