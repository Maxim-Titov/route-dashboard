import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const formatPhone = (phone) => {
    if (!phone) return phone
    const withPlus = phone.startsWith('+') ? phone : '+' + phone
    const parsed = parsePhoneNumberFromString(withPlus)
    return parsed ? parsed.formatInternational() : phone
}
