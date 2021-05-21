exports.checkUserName = async (name) => {
    name = name.trim()
    var pattern = /^[a-zA-Z ]+$/
    if (name.search(pattern) == -1) {
        return false
    }
    return true
}

exports.checkUserPhone = async (phone) => {
    phone = phone.trim()
    var pattern = /^[0-9]{10}$/
    if (phone.search(pattern) == -1) {
        return false
    }
    return true
}

exports.checkUserPasswordStrength = async (password) => {

    var pattern = /^[a-zA-Z0-9@!%$*]{8,15}$/
    if (password.search(pattern) == -1) {
        return false
    }
    return true
}