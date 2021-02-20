function hmsms(ms) {
    let h = Math.floor(ms / 1000 / 60 / 60);
    let m = Math.floor((ms / 1000 / 60 / 60 - h) * 60);
    let sDecimal = (((ms / 1000 / 60 / 60 - h) * 60 - m) * 60);
    let s = Math.floor(sDecimal);
    let leftoverMs = Math.round((sDecimal - Math.floor(sDecimal)) * 1000);
    return {
        hours: h,
        minutes: m,
        seconds: s,
        milliseconds: leftoverMs
    }
}

console.log(hmsms(256725672567));