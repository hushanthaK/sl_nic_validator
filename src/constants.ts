const OLD_NIC_REGEX = /^[0-9]{9}[vVxX]$/;
const NEW_NIC_REGEX = /^[0-9]{12}$/;
const OLD_NIC_LENGTH = 10; // 9 digits + 1 letter
const NEW_NIC_LENGTH = 12;

export {
  OLD_NIC_REGEX,
  NEW_NIC_REGEX,
  OLD_NIC_LENGTH,
  NEW_NIC_LENGTH
};