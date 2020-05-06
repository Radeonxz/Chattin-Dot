/**
 * check string is email
 * @param {string} email email string
 * @returns {boolean} whether the string is email
 */
export const isEmail = (email) => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

/**
 * convert to string
 * @param {number} id object id
 * @returns {string} converted string
 */
export const toString = (id = "") => {
  return `${id}`;
};
