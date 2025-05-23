import {scaledPixels} from '../hooks/useScale';

export const sizes = {
    program: {
        landscape: {width: scaledPixels(450), height: scaledPixels(200)},
        portrait: {width: scaledPixels(200), height: scaledPixels(250)},
        long: {width: scaledPixels(416), height: scaledPixels(250)},
    },
    menu: {
        open: scaledPixels(400),
        closed: scaledPixels(100),
        icon: scaledPixels(20),
    },
};
