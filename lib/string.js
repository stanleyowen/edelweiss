function removeDuplicates(str) {
  return [...new Set(str.split(""))].join("");
}

module.exports = removeDuplicates;
