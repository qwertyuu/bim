function valueFromPx(pxString) {
    return pxString.substr(0, pxString.length - 2);
}

function bitCheck(bitfield, flag) {
    return (bitfield & flag) === flag;
}