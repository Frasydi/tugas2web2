
const capFirstLetter = (text) => {
    if(text == null) {
        return text
    }
    const texts = text.split( /,| |\./)
    let result = "";
    texts.forEach(el => {
        result += caps(el) + " "
    })
    return result
    
}
function caps(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() 
}
exports.capFirstLetter = capFirstLetter