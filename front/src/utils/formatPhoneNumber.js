import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const formatPhone = (phone, country = 'UA') => {
    const parsed = parsePhoneNumberFromString(phone, country)
    return parsed ? parsed.formatInternational() : phone
}
