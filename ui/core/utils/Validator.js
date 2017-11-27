export function validatePESEL(pesel) {
    var reg = /^[0-9]{11}$/;
    if (reg.test(pesel) == false)
        return false;
    else {
        var digits = ("" + pesel).split("");
        if ((parseInt(pesel.substring(4, 6)) > 31) || (parseInt(pesel.substring(2, 4)) > 12))
            return false;

        var checksum = (1 * parseInt(digits[0]) + 3 * parseInt(digits[1]) + 7 * parseInt(digits[2]) + 9 * parseInt(digits[3]) + 1 * parseInt(digits[4]) + 3 * parseInt(digits[5]) + 7 * parseInt(digits[6]) + 9 * parseInt(digits[7]) + 1 * parseInt(digits[8]) + 3 * parseInt(digits[9])) % 10;
        if (checksum == 0) checksum = 10;
        checksum = 10 - checksum;

        try {
            return (parseInt(digits[10]) == checksum);
        } catch (e) {
            return false;
        }
    }
}

export function validateNIP(nip) {
    var nipWithoutDashes = nip.replace(/-/g, "");
    var reg = /^[0-9]{10}$/;
    if (reg.test(nipWithoutDashes) == false) {
        return false;
    }
    else {
        var digits = ("" + nipWithoutDashes).split("");
        var checksum = (6 * parseInt(digits[0]) + 5 * parseInt(digits[1]) + 7 * parseInt(digits[2]) + 2 * parseInt(digits[3]) + 3 * parseInt(digits[4]) + 4 * parseInt(digits[5]) + 5 * parseInt(digits[6]) + 6 * parseInt(digits[7]) + 7 * parseInt(digits[8])) % 11;

        return (parseInt(digits[9]) == checksum);
    }
}

export function validateREGON(regon) {
    var reg = /^[0-9]{9}$/;
    if (!reg.test(regon))
        return false;
    else {
        var digits = ("" + regon).split("");
        var checksum = (8 * parseInt(digits[0]) + 9 * parseInt(digits[1]) + 2 * parseInt(digits[2]) + 3 * parseInt(digits[3]) + 4 * parseInt(digits[4]) + 5 * parseInt(digits[5]) + 6 * parseInt(digits[6]) + 7 * parseInt(digits[7])) % 11;
        if (checksum == 10)
            checksum = 0;

        return (parseInt(digits[8]) == checksum);
    }
}