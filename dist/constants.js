"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEW_NIC_LENGTH = exports.OLD_NIC_LENGTH = exports.NEW_NIC_REGEX = exports.OLD_NIC_REGEX = void 0;
const OLD_NIC_REGEX = /^[0-9]{9}[vVxX]$/;
exports.OLD_NIC_REGEX = OLD_NIC_REGEX;
const NEW_NIC_REGEX = /^[0-9]{12}$/;
exports.NEW_NIC_REGEX = NEW_NIC_REGEX;
const OLD_NIC_LENGTH = 10; // 9 digits + 1 letter
exports.OLD_NIC_LENGTH = OLD_NIC_LENGTH;
const NEW_NIC_LENGTH = 12;
exports.NEW_NIC_LENGTH = NEW_NIC_LENGTH;
